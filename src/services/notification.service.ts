import PusherConfig from "../config/pusher.config";
import companyRepository from "../repository/company.repository";
import notificationRepository from "../repository/notification.repository";
import requirementRepository from "../repository/requirement.repository";
import { NotificationData, NotificationType } from "../types/pusher/notifications.type";

export class NotificationService {
  private static instance: NotificationService;
  
  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  /**
   * Send notification with Pusher and store in DB
   */
  async sendNotification(notification: Omit<NotificationData, 'id' | 'timestamp'>): Promise<NotificationData> {
    try {
      // Store in database first
      const storedNotification = await notificationRepository.createNotification({
        ...notification,
        timestamp: new Date()
      });
      console.log(storedNotification)

      // Prepare notification data for Pusher
      const pusherData: NotificationData = {
        ...storedNotification,
        timestamp: storedNotification.createdAt
      };

      // Determine channel
      const channel = notification.channel || 
                     (notification.userId ? `private-user-${notification.userId}` : 'public-notifications');

      // Send real-time notification
      await PusherConfig.trigger(
        channel,
        'new-notification',
        pusherData
      );

      // If it's a channel-specific notification, also trigger on type-based channel
      if (!notification.userId && notification.type) {
        const typeChannel = this.getTypeChannel(notification.type);
        if (typeChannel) {
          await PusherConfig.trigger(
            typeChannel,
            'new-notification',
            pusherData
          );
        }
      }

      return pusherData;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  }

  /**
   * Send notification to specific user
   */
  async sendToUser(userId: number, notification: Omit<NotificationData, 'id' | 'timestamp' | 'userId'>): Promise<NotificationData> {
    try {
      const notificationWithUser: Omit<NotificationData, 'id' | 'timestamp'> = {
        ...notification,
        userId
      };

      return await this.sendNotification(notificationWithUser);
    } catch (error) {
      console.error('Error sending notification to user:', error);
      throw error;
    }
  }

  /**
   * Send notification to multiple users
   */
  async sendToUsers(userIds: number[], notification: Omit<NotificationData, 'id' | 'timestamp' | 'userId'>): Promise<NotificationData[]> {
    try {
      const promises = userIds.map(userId => 
        this.sendToUser(userId, notification)
      );
      
      return await Promise.all(promises);
    } catch (error) {
      console.error('Error sending notifications to users:', error);
      throw error;
    }
  }

  /**
   * Send system notification (no specific user)
   */
  async sendSystemNotification(
    type: NotificationType,
    title: string,
    message: string,
    data?: Record<string, any>
  ): Promise<NotificationData> {
    try {
      const notification: Omit<NotificationData, 'id' | 'timestamp'> = {
        title,
        message,
        type,
        data,
        channel: 'system-notifications'
      };

      return await this.sendNotification(notification);
    } catch (error) {
      console.error('Error sending system notification:', error);
      throw error;
    }
  }

  /**
   * Helper method for specific notification types
   */
  async sendQuoteRequestSent(userId: number, userName: string, requirementId: number): Promise<NotificationData> {
   const requirement = await requirementRepository.getRequirementById(requirementId);

    return this.sendToUser(userId, {
      title: 'New Quote Request',
      message: `You have a new quote request from ${userName}}`,
      type: 'quote_request_sent',
      data: { userId, userName, requirement, requirementId },
      channel: "company_quote_request"
    });
  }

  async sendNewQuoteCreated(clientId: number, quoteId: number, requirementName: string, companyName: string): Promise<NotificationData> {
    return this.sendToUser(clientId, {
      title: 'New Quote',
      message: `You have got a new quote for ${requirementName} from ${companyName}.`,
      type: 'new_quote_created',
      data: { quoteId, companyName, requirementName }
    });
  }

  async sendNewCompanyPendingVerification(adminUserId: number, companyId: number, companyName: string): Promise<NotificationData> {
    return this.sendToUser(adminUserId, {
      title: 'New Company Verification',
      message: `You have a new pending verification request from "${companyName}"`,
      type: 'new_company_pending_verification',
      data: { companyId, companyName }
    });
  }

  async sendContractGenerated(userId: number, contractId: number): Promise<NotificationData> {
    return this.sendToUser(userId, {
      title: 'Contract Generated',
      message: 'Your contract has been generated successfully.',
      type: 'contract_generated',
      data: { contractId }
    });
  }

  async sendPaymentReceived(userId: number, paymentId: number, amount: number): Promise<NotificationData> {
    return this.sendToUser(userId, {
      title: 'Payment Received',
      message: `Payment of $${amount.toFixed(2)} has been received.`,
      type: 'payment_received',
      data: { paymentId, amount }
    });
  }

  /**
   * Get notifications for user
   */
  async getUserNotifications(
    userId: number, 
    options: {
      read?: boolean;
      type?: NotificationType;
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<NotificationData[]> {
    try {
      const notifications = await notificationRepository.getNotifications({
        userId,
        ...options
      });

      return notifications;
    } catch (error) {
      console.error('Error getting user notifications:', error);
      throw error;
    }
  }

  /**
   * Mark notifications as read
   */
  async markAsRead(notificationIds: number[]): Promise<{ count: number }> {
    try {
      return await notificationRepository.markMultipleAsRead(notificationIds);
    } catch (error) {
      console.error('Error marking notifications as read:', error);
      throw error;
    }
  }

  /**
   * Get unread count for user
   */
  async getUnreadCount(userId: number, type?: NotificationType): Promise<number> {
    try {
      return await notificationRepository.getUnreadCount({ userId, type });
    } catch (error) {
      console.error('Error getting unread count:', error);
      throw error;
    }
  }

  /**
   * Get channel name based on notification type
   */
  private getTypeChannel(type: NotificationType): string | null {
    const typeChannels: Record<NotificationType, string> = {
      'quote_request_sent': 'channel-quotes',
      'new_quote_created': 'channel-quotes',
      'new_company_pending_verification': 'channel-admin',
      'contract_generated': 'channel-contracts',
      'payment_received': 'channel-payments'
    };

    return typeChannels[type] || null;
  }
}

export default NotificationService.getInstance();