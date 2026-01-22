import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import chatController from '../controller/chat.controller';

const chatRouter = Router();

// All routes require authentication
chatRouter.use(authMiddleware);

// Chat management
chatRouter.get('/chats', chatController.getChats);
chatRouter.get('/chat/:otherUserId', chatController.getOrCreateChat);
chatRouter.get('/chat/:chatId/messages', chatController.getMessages);
chatRouter.post('/message/send', chatController.sendMessage);
chatRouter.put('/messages/read', chatController.markAsRead);

// Presence tracking
chatRouter.post('/presence', chatController.updatePresence);
chatRouter.get('/presence', chatController.getPresence);

// Pusher authentication
chatRouter.post('/pusher/auth', chatController.pusherAuth);

export default chatRouter;