import { errorResponse } from "../helpers/errorMsg.helper";
import chatRepository from "../repository/chat.repository";
import { NextFunction, Request, Response } from "express";
import { MarkAsReadDto, SendMessageDto, TypingIndicatorDto } from "../types/chat.types";
import chatService from "../services/chat.service";
import prisma from "../config/dbconfig";


class ChatController {
    // Get user's chats
   async getChats(req: Request, res: Response, next: NextFunction) {
      try {
         const request = req as Request & { userId: string };
         const userId = Number(request.userId);
         const chats = await chatRepository.getUserChats(userId);
         
         // Get presence for all chat participants
         const participantIds = chats.flatMap(chat => [
         chat.participant1Id,
         chat.participant2Id,
         ]).filter(id => id !== userId);
         
         const presences = await chatRepository.getUsersPresence(participantIds);
         const presenceMap = new Map(presences.map(p => [p.userId, p]));
         
         const chatsWithPresence = chats.map(chat => ({
         ...chat,
         otherParticipant: {
            ...chat.otherParticipant,
            isOnline: presenceMap.get(chat.otherParticipant.id)?.isOnline || false,
            lastSeen: presenceMap.get(chat.otherParticipant.id)?.lastSeen || null,
         },
         }));
         
         res.status(200).json({ data: chatsWithPresence });
      } catch (error) {
         errorResponse(error, res, "Failed to fetch chats")
      }
   }

   // Get or create chat with another user
  async getOrCreateChat(req: Request, res: Response) {
    try {
      const request = req as Request & { userId: string };
      const userId = Number(request.userId);
      const { otherUserId } = req.params;
      
      const chat = await chatRepository.getOrCreateChat(userId, parseInt(otherUserId));
      
      // Get presence of other user
      const presence = await chatRepository.getUserPresence(parseInt(otherUserId));
      
      res.json({
        ...chat,
        otherParticipant: {
          ...(chat.participant1Id === userId ? chat.participant2 : chat.participant1),
          isOnline: presence?.isOnline || false,
          lastSeen: presence?.lastSeen || null,
        },
      });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

    // Get chat messages
   async getMessages(req: Request, res: Response) {
      try {
         const request = req as Request & { userId: string };
         const userId = Number(request.userId);
         const { chatId } = req.params;
         const page = parseInt(req.query.page as string) || 1;
         const limit = parseInt(req.query.limit as string) || 50;
         
         const messages = await chatRepository.getChatMessages(Number(chatId), userId, page, limit);
         res.status(200).json({data: messages});
      } catch (error: any) {
         res.status(400).json({ error: error.message });
      }
   }

    // Send message
   async sendMessage(req: Request, res: Response) {
      try {
         const request = req as Request & { userId: string };
         const userId = Number(request.userId);

         const { receiverId, content, attachments = [] }: SendMessageDto = req.body;
         
         // Get or create chat
         const chat = await chatRepository.getOrCreateChat(userId, receiverId);
         
         // Send message
         const message = await chatRepository.sendMessage(chat.id, userId, content, attachments);
      
                  
         res.json({
            message,
            chatId: chat.id,
         });

         // Trigger real-time event
         chatService.triggerMessageSent(chat.id, message);
      } catch (error: any) {
         res.status(400).json({ error: error.message });
      }
   }

   // Mark messages as read
  async markAsRead(req: Request, res: Response) {
    try {
      const request = req as Request & { userId: string };
      const userId = Number(request.userId);
      const { chatId, messageIds }: MarkAsReadDto = req.body;
      
      const result = await chatRepository.markMessagesAsRead(chatId, userId, messageIds);
      
      // Trigger real-time event for other participant
      await chatService.triggerMessageUpdated(chatId, { 
        type: 'marked-read',
        messageIds,
        userId 
      });
      
      res.json({ success: true, count: result.count });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
  
  // Update user presence
  async updatePresence(req: Request, res: Response) {
    try {
      const request = req as Request & { userId: string };
      const userId = Number(request.userId);
      const { isOnline, socketId } = req.body;
      
      const presence = await chatRepository.updateUserPresence(userId, isOnline, socketId);
      
      // Trigger presence update
      await chatService.triggerPresenceUpdate(userId, isOnline, presence.lastSeen);
      
      res.json({ success: true, presence });
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }

  // Get user presence
  async getPresence(req: Request, res: Response) {
    try {
      const request = req as Request & { userId: string };
      const userId = Number(request.userId);
      const { userIds } = req.query;
      
      if (userIds) {
        const ids = (userIds as string).split(',').map(id => parseInt(id));
        const presences = await chatRepository.getUsersPresence(ids);
        res.json(presences);
      } else {
        const presence = await chatRepository.getUserPresence(userId);
        res.json(presence);
      }
    } catch (error: any) {
      res.status(400).json({ error: error.message });
    }
  }
  
  // Pusher authentication endpoint
  async pusherAuth(req: Request, res: Response) {
    try {
      const request = req as Request & { userId: string };
      const userId = Number(request.userId);
      const socketId = req.body.socket_id;
      const channel = req.body.channel_name;
      
      // Only allow private and presence channels
      if (!channel.startsWith('private-') && !channel.startsWith('presence-')) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      
      let presenceData = undefined;
      if (channel.startsWith('presence-')) {
        // Get user info for presence channel
        const user = await prisma.user.findUnique({
          where: { id: userId },
          select: { id: true, name: true, email: true },
        });
        
        if (!user) {
          return res.status(403).json({ error: 'User not found' });
        }
        
        presenceData = {
          user_id: userId.toString(),
          user_info: user,
        };
      }
      
      const auth = chatService.authenticate(socketId, channel, presenceData);
      res.json(auth);
    } catch (error: any) {
      res.status(403).json({ error: 'Authentication failed' });
    }
  }



}

export default new ChatController();