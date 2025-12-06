import { NextFunction, Request, Response } from 'express';
import { NotificationData, NotificationType } from '../types/pusher/notifications.type';
import notificationService, { NotificationService } from '../services/notification.service';
import { errorResponse } from '../helpers/errorMsg.helper';
import companyRepository from '../repository/company.repository';
import requirementRepository from '../repository/requirement.repository';
import { authMiddleware } from '../middleware/authMiddleware';
import notificationRepository from '../repository/notification.repository';

class NotificationController{
   /**
   * Send notification (generic endpoint)
   */
   sendNotification = [
      async(req:Request<{}, {}, NotificationData>, res: Response, next: NextFunction): Promise<void> => {
         try {
            const { title, message, type, userId, channel, data } = req.body;

            // Validation
            if (!title || !message || !type) {
               res.status(400).json({ 
                  success: false, 
                  error: 'Title, message, and type are required' 
               });
            }

            // Validate notification type
            const validTypes: NotificationType[] = [
               'quote_request_sent',
               'new_quote_created',
               'new_company_pending_verification',
               'contract_generated',
               'payment_received'
            ];

            if (!validTypes.includes(type)) {
            res.status(400).json({ 
               success: false, 
               error: 'Invalid notification type' 
            });
            }

            const notification = await notificationService.sendNotification({
               title,
               message,
               type,
               userId,
               channel,
               data
            });

            res.status(200).json({ 
               success: true, 
               message: 'Notification sent successfully',
               notification
            });
         } catch (error: any) {
            errorResponse(error, res, error.message || "Failed to send notifications");
         }
      }
   ]

   /**
   * Send specific notification types
   */
   sendQuoteRequest = [
      async(req:Request<{}, {}, NotificationData>, res: Response, next: NextFunction): Promise<void> => {
         try {
            const { userId, userName, requirementId } = req.body;

            if (!userId || !userName) {
               res.status(400).json({ 
                  success: false, 
                  error: 'UserId and quoteId are required' 
               });
            }

            const notification = await notificationService.sendQuoteRequestSent(userId, userName, requirementId);

            res.status(200).json({ 
               success: true, 
               message: 'Quote request notification sent',
               notification
            });
         } catch (error: any) {
            errorResponse(error, res, error.message || "Failed to send quote request notifications");
         }
      }
   ]

   sendNewQuoteCreated = [
      async(req:Request<{}, {}, NotificationData>, res: Response, next: NextFunction): Promise<void> => {
         try {
            const { companyId, quoteId, requirementId, userId } = req.body;
            const company = companyRepository.getCompanyById(companyId);
            const requirement = requirementRepository.getRequirementById(requirementId);

            if (!companyId || !quoteId || !requirementId) {
               res.status(400).json({ 
                  success: false, 
                  error: 'adminUserId, quoteId, and requirementName are required' 
               });
            }

            const notification = await notificationService.sendNewQuoteCreated(userId, quoteId, (await requirement).title, (await company).name);

            res.status(200).json({ 
               success: true, 
               message: 'Quote request notification sent',
               notification
            });
         } catch (error: any) {
            errorResponse(error, res, error.message || "Failed to send quote request notifications");
         }
      }
   ]

   sendNewCompanyPendingVerification = [
      async(req:Request<{}, {}, NotificationData>, res: Response, next: NextFunction): Promise<void> => {
         try {
            const { userId, companyId } = req.body;

            const company = companyRepository.getCompanyById(companyId);

            if (!userId || !companyId) {
               res.status(400).json({ 
                  success: false, 
                  error: 'adminUserId, companyId, and companyName are required' 
               });                                          
            }

            const notification = await notificationService.sendNewCompanyPendingVerification(userId, companyId, (await company).name);

            res.status(200).json({ 
               success: true, 
               message: 'Quote request notification sent',
               notification
            });
         } catch (error: any) {
            errorResponse(error, res, error.message || "Failed to send quote request notifications");
         }
      }
   ]

   /**
   * Get user notifications
   */
   getUserNotifications = [
      authMiddleware,
      async(req:Request<{}, {}, NotificationData>, res: Response, next: NextFunction): Promise<void> => {
         try {
            const request = req as Request & { userId: string };
            const userId = Number(request.userId);
             const { 
               read, 
               type, 
               limit = '50', 
               offset = '0',
               startDate,
               endDate 
            } = req.query;

             if (isNaN(userId)) {
               res.status(400).json({ 
                  success: false, 
                  error: 'Valid user ID is required' 
               });
            }

            const notifications = await notificationRepository.getNotifications({
               userId,
               read: read ? read === 'true' : undefined,
               type: type as NotificationType,
               limit: parseInt(limit as string),
               offset: parseInt(offset as string),
               startDate: startDate ? new Date(startDate as string) : undefined,
               endDate: endDate ? new Date(endDate as string) : undefined
            });

            res.status(200).json({ 
               success: true, 
               notifications 
            });
         } catch (error: any) {
            errorResponse(error, res, error.message || "Error getting user notifications");
         }
      }
   ]

   /**
   * Mark as read
   */
   markAsRead = [
      authMiddleware,
      async(req:Request<{}, {}, NotificationData>, res: Response, next: NextFunction): Promise<void> => {
         try {
            const { notificationIds } = req.body;
            if (!notificationIds || !Array.isArray(notificationIds) || notificationIds.length === 0) {
               res.status(400).json({ 
                  success: false, 
                  error: 'Notification IDs array is required' 
               });
            }

              // Validate all IDs are numbers
            if (!notificationIds.every(id => !isNaN(id))) {
               res.status(400).json({ 
                  success: false, 
                  error: 'All notification IDs must be numbers' 
               });
            }
            
            const result = await notificationRepository.markMultipleAsRead(notificationIds);
            res.status(200).json({ 
               success: true, 
               message: `${result.count} notification(s) marked as read` 
            });
         } catch (error: any) {
            errorResponse(error, res, error.message || "Failed to mark notifications as read");
         }
      }
   ]

   /**
   * Get unread count
   */
   getUnreadCount = [
      authMiddleware,
      async(req:Request<{}, {}, NotificationData>, res: Response, next: NextFunction): Promise<void> => {
         try {
            const request = req as Request & { userId: string };
            const userId = Number(request.userId);
            const { type } = req.query;

            if (isNaN(userId)) {
               res.status(400).json({ 
                  success: false, 
                  error: 'Valid user ID is required' 
               });
            }

            const count = await notificationRepository.getUnreadCount({
               userId,
               type: type as NotificationType
            });

            res.status(200).json({ 
               success: true, 
               count 
            });
         } catch (error: any) {
            errorResponse(error, res, error.message || "Failed to mark notifications as read");
         }
      }
   ]

   /**
   * Delete Notification
   */
   deleteNotification = [
      authMiddleware,
      async(req:Request<{}, {}, NotificationData>, res: Response, next: NextFunction): Promise<void> => {
         try {
            const { id } = req.body;

            if (!id) {
               res.status(400).json({ 
                  success: false, 
                  error: 'Notification ID is required' 
               });
            }

            const result = await notificationRepository.deleteNotification(id);

            res.status(200).json({ 
               success: true, 
               message: "notification deleted" 
            });
         } catch (error: any) {
            errorResponse(error, res, error.message || "Failed to delete notifications");
         }
      }
   ]
}

export default new NotificationController();