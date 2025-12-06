export type NotificationType =
  | 'quote_request_sent'
  | 'new_quote_created'
  | 'new_company_pending_verification'
  | 'contract_generated'
  | 'payment_received';

  export interface NotificationData {
  id?: number;
  title: string;
  message: string;
  type: NotificationType;
  userId?: number; 
  isRead?: boolean;
  channel?: string; 
  data?: Record<string, any>;
  timestamp?: Date;
  createdAt?: Date;
  updatedAt?: Date;
  quoteId?: number;
  companyId?: number;
  requirementId?: number;
  notificationIds?: number[];
  userName?: string;
}