import { Notification } from "@prisma/client";
import prisma from "../config/dbconfig";
import { NotificationData, NotificationType } from "../types/pusher/notifications.type";

class NotificationRepository {

   private mapToStoredNotification(notification: Notification): NotificationData {
      return {
         id: notification.id,
         title: notification.title,
         message: notification.message,
         type: notification.type as NotificationType,
         userId: notification.userId || undefined,
         channel: notification.channel || undefined,
         data: notification.data as Record<string, any> || {},
         isRead: notification.isRead,
         timestamp: notification.createdAt,
         createdAt: notification.createdAt
      };
   }

   /**
   * Store notification in database
   */
  async createNotification(notification: Omit<NotificationData, 'id'>): Promise<NotificationData> {
      const storedNotification =  await prisma.notification.create({
        data: {
          title: notification.title,
          message: notification.message,
          type: notification.type as any,
          userId: notification.userId || null,
          channel: notification.channel || null,
          data: notification.data || {},
          createdAt: notification.timestamp || new Date()
        }
      });

      return this.mapToStoredNotification(storedNotification);
  }

   /**
   * Batch create notifications
   */
  async createNotifications(notifications: Omit<NotificationData, 'id'>[]): Promise<NotificationData[]> {
      const createdNotifications = await prisma.$transaction(
        notifications.map(notification => 
          prisma.notification.create({
            data: {
              title: notification.title,
              message: notification.message,
              type: notification.type as any,
              userId: notification.userId || null,
              channel: notification.channel || null,
              data: notification.data || {},
              createdAt: notification.timestamp || new Date()
            }
          })
        )
      );

      return createdNotifications.map(this.mapToStoredNotification);
   }

   /**
   * Get notifications with filters
   */
  async getNotifications(filters: {
      userId?: number;
      type?: NotificationType;
      channel?: string;
      read?: boolean;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
      offset?: number;
   } = {}): Promise<NotificationData[]> {
      try {
         const {
         userId,
         type,
         channel,
         read,
         startDate,
         endDate,
         limit = 50,
         offset = 0
         } = filters;

         const where: any = {};

         if (userId !== undefined) where.userId = userId;
         if (type) where.type = type as any;
         if (channel) where.channel = channel;
         if (read !== undefined) where.isRead = read;
         
         if (startDate || endDate) {
         where.createdAt = {};
         if (startDate) where.createdAt.gte = startDate;
         if (endDate) where.createdAt.lte = endDate;
         }

         const notifications = await prisma.notification.findMany({
         where,
         orderBy: { createdAt: 'desc' },
         take: limit,
         skip: offset
         });

         return notifications.map(this.mapToStoredNotification);
      } catch (error) {
         console.error('Error getting notifications:', error);
         throw new Error(`Failed to get notifications: ${error.message}`);
      }
   }

   async getNotificationById(id: number): Promise<NotificationData | null> {
      const notification = await prisma.notification.findUnique({
        where: { id }
      });

      return notification ? this.mapToStoredNotification(notification) : null;
   }

   async markAsRead(id: number): Promise<NotificationData> {
      const notification = await prisma.notification.update({
        where: { id },
        data: { 
          isRead: true
        }
      });

      return this.mapToStoredNotification(notification);
   }

   async markMultipleAsRead(ids: number[]): Promise<{ count: number }> {
       const result = await prisma.notification.updateMany({
        where: { 
          id: { in: ids },
          isRead: false
        },
        data: { 
          isRead: true
        }
      });

      return { count: result.count };
   }

    /**
   * Mark all user notifications as read
   */
  async markAllAsRead(userId: number): Promise<{ count: number }> {
   const result = await prisma.notification.updateMany({
        where: { 
          userId,
          isRead: false
        },
        data: { 
          isRead: true
        }
      });
      
      return { count: result.count };
  }

   /**
   * Get unread count
   */
  async getUnreadCount(filters: {
    userId?: number;
    type?: NotificationType;
    channel?: string;
  } = {}): Promise<number> {
      const { userId, type, channel } = filters;

      const where: any = { isRead: false };
      if (userId !== undefined) where.userId = userId;
      if (type) where.type = type as any;
      if (channel) where.channel = channel;

      const count = await prisma.notification.count({ where });

      return count;
  }

   /**
   * Delete notification
   */
  async deleteNotification(id: number): Promise<void> {
    await prisma.notification.delete({
        where: { id }
      });
  }

}

export default new NotificationRepository();