import PusherConfig from "../config/pusher.config";

class ChatService {
  // Trigger chat events
  async triggerMessageSent(chatId: number, message: any) {
    await PusherConfig.trigger(`chat-${chatId}`, 'message-sent', {
      message,
      timestamp: new Date().toISOString(),
    });
  }

  
  async triggerPresenceUpdate(userId: number, isOnline: boolean, lastSeen: Date) {
    await PusherConfig.trigger('presence-updates', 'user-presence', {
      userId,
      isOnline,
      lastSeen,
      timestamp: new Date().toISOString(),
    });
  }

   async triggerMessageUpdated(chatId: number, message: any) {
    await PusherConfig.trigger(`chat-${chatId}`, 'message-updated', {
      message,
      timestamp: new Date().toISOString(),
    });
  }
  
  // Authenticate user for private channels
  authenticate(socketId: string, channel: string, presenceData?: any) {
    if (channel.startsWith('private-') || channel.startsWith('presence-')) {
      return PusherConfig.authenticate(socketId, channel, presenceData);
    }
    throw new Error('Unauthorized');
  }
}

export default new ChatService();