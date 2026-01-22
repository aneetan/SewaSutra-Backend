import Pusher from "pusher";

const PusherConfig =new Pusher({
      appId: process.env.PUSHER_APP_ID,
      key: process.env.PUSHER_APP_KEY,
      secret: process.env.PUSHER_APP_SECRET,
      cluster: process.env.PUSHER_APP_CLUSTER,
      useTLS: true
});

export const pusherChannels = {
  PRESENCE: 'presence-chat',
  PRIVATE: (userId: string) => `private-user-${userId}`,
  CONVERSATION: (conversationId: string) => `private-conversation-${conversationId}`
};

export default PusherConfig;