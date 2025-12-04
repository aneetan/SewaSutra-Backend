// types/payment.types.ts
export type PaymentType = 'ESEWA' | 'STRIPE';

export interface BasePaymentMethod {
  id: number;
  type: PaymentType;
  isDefault: boolean;
  companyId: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface EsewaPaymentMethod extends BasePaymentMethod {
  type: 'ESEWA';
  accountName: string;
  phoneNumber: string;
}

export interface StripePaymentMethod extends BasePaymentMethod {
  type: 'STRIPE';
  publicKey: string;
  secretKey: string;
  businessName?: string;
}

export type PaymentMethodUnion = EsewaPaymentMethod | StripePaymentMethod;

// DTOs for requests
export interface CreatePaymentMethodDto {
  type: PaymentType;
  accountName?: string;
  phoneNumber?: string;
  publicKey?: string;
  secretKey?: string;
  businessName?: string;
  isDefault?: boolean;
  companyId: number;
}

export interface UpdatePaymentMethodDto {
  accountName?: string;
  phoneNumber?: string;
  publicKey?: string;
  secretKey?: string;
  businessName?: string;
  isDefault?: boolean;
}

export interface PaymentMethodResponse {
  success: boolean;
  message: string;
  data?: PaymentMethod | PaymentMethod[];
  error?: string;
}