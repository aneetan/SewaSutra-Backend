import { Router } from "express";
import notificationController from "../controller/notification.controller";

const notificationRouter = Router();

notificationRouter.post('/send', notificationController.sendNotification);
notificationRouter.post('/send-quote-request', notificationController.sendQuoteRequest);
notificationRouter.post('/send-new-quote-request', notificationController.sendNewQuoteCreated);
notificationRouter.post('/send-new-company', notificationController.sendNewCompanyPendingVerification);
notificationRouter.get('/user-notification', notificationController.getUserNotifications);
notificationRouter.put('/mark-read', notificationController.markAsRead);
notificationRouter.get('/unread-count', notificationController.getUnreadCount);
notificationRouter.delete('/:id', notificationController.deleteNotification);

export default notificationRouter;
