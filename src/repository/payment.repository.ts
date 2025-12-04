import { PrismaClient, PaymentMethod, Prisma } from "@prisma/client";
import { 
  PaymentMethodUnion, 
  EsewaPaymentMethod, 
  StripePaymentMethod,
  CreatePaymentMethodDto,
  UpdatePaymentMethodDto 
} from "../types/company/payment.type";
import companyRepository from "./company.repository";

const prisma = new PrismaClient();

class PaymentRepository {
  // Convert Prisma PaymentMethod to union type
  private toPaymentMethodUnion(payment: PaymentMethod): PaymentMethodUnion {
    if (payment.type === 'ESEWA') {
      return {
        id: payment.id,
        type: 'ESEWA',
        accountName: payment.accountName!,
        phoneNumber: payment.phoneNumber!,
        isDefault: payment.isDefault,
        companyId: payment.companyId,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
      } as EsewaPaymentMethod;
    } else {
      return {
        id: payment.id,
        type: 'STRIPE',
        publicKey: payment.publicKey!,
        secretKey: payment.secretKey!,
        businessName: payment.businessName || undefined,
        isDefault: payment.isDefault,
        companyId: payment.companyId,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
      } as StripePaymentMethod;
    }
  }

  // Find all payment methods for a company
  async getAllPayments(userId?: number): Promise<PaymentMethodUnion[]> {
    const company = await companyRepository.getCompanyByUser(userId);
    
    const payments = await prisma.paymentMethod.findMany({
      where: { companyId: company.id },
      orderBy: { isDefault: 'desc' },
    });

    return payments.map(payment => this.toPaymentMethodUnion(payment));
  }

  // Get payment by ID
  async getPaymentById(id: string, userId?: number): Promise<PaymentMethodUnion | null> {
    const company = await companyRepository.getCompanyByUser(userId);
    
    const payment = await prisma.paymentMethod.findFirst({
      where: { 
        id: parseInt(id),
        companyId: company.id 
      },
    });

    return payment ? this.toPaymentMethodUnion(payment) : null;
  }

  // Create new payment method
  async createPayment(userId: number, paymentData: CreatePaymentMethodDto): Promise<PaymentMethodUnion> {
    const company = await companyRepository.getCompanyByUser(userId);

    // If setting as default, unset other defaults
    if (paymentData.isDefault) {
      await prisma.paymentMethod.updateMany({
        where: { 
          companyId: company.id, 
          isDefault: true 
        },
        data: { isDefault: false },
      });
    }

    // Check if type already exists for this company
    const existing = await prisma.paymentMethod.findFirst({
      where: {
        companyId: company.id,
        type: paymentData.type,
      },
    });

    if (existing) {
      throw new Error(`${paymentData.type} payment method already exists for this company`);
    }

    const payment = await prisma.paymentMethod.create({
      data: {
        type: paymentData.type,
        accountName: paymentData.accountName,
        phoneNumber: paymentData.phoneNumber,
        publicKey: paymentData.publicKey,
        secretKey: paymentData.secretKey,
        businessName: paymentData.businessName,
        isDefault: paymentData.isDefault || false,
        companyId: company.id,
      },
    });

    return this.toPaymentMethodUnion(payment);
  }

  // Update payment method
  async updatePayment(id: string, userId: number, updates: UpdatePaymentMethodDto): Promise<PaymentMethodUnion> {
    const company = await companyRepository.getCompanyByUser(userId);
    
    // Get current payment method
    const current = await prisma.paymentMethod.findFirst({
      where: { 
        id: parseInt(id),
        companyId: company.id 
      },
    });

    if (!current) {
      throw new Error('Payment method not found');
    }

    // If setting as default, unset other defaults
    if (updates.isDefault) {
      await prisma.paymentMethod.updateMany({
        where: { 
          companyId: company.id, 
          id: { not: parseInt(id) },
          isDefault: true 
        },
        data: { isDefault: false },
      });
    }

    const payment = await prisma.paymentMethod.update({
      where: { id: parseInt(id) },
      data: {
        accountName: updates.accountName,
        phoneNumber: updates.phoneNumber,
        publicKey: updates.publicKey,
        secretKey: updates.secretKey,
        businessName: updates.businessName,
        isDefault: updates.isDefault,
      },
    });

    return this.toPaymentMethodUnion(payment);
  }

  // Delete payment method
  async deletePayment(id: string, userId: number): Promise<PaymentMethodUnion> {
    const company = await companyRepository.getCompanyByUser(userId);
    
    const payment = await prisma.paymentMethod.findFirst({
      where: { 
        id: parseInt(id),
        companyId: company.id 
      },
    });

    if (!payment) {
      throw new Error('Payment method not found');
    }

    // Don't allow deleting the default if it's the only one
    if (payment.isDefault) {
      const allMethods = await prisma.paymentMethod.findMany({
        where: { companyId: company.id },
      });
      
      if (allMethods.length === 1) {
        throw new Error('Cannot delete the only payment method');
      }
    }

    const deletedPayment = await prisma.paymentMethod.delete({
      where: { id: parseInt(id) },
    });

    return this.toPaymentMethodUnion(deletedPayment);
  }

  // Set default payment method
  async setDefaultPayment(id: string, userId: number): Promise<PaymentMethodUnion> {
    const company = await companyRepository.getCompanyByUser(userId);
    
    const payment = await prisma.paymentMethod.findFirst({
      where: { 
        id: parseInt(id),
        companyId: company.id 
      },
    });

    if (!payment) {
      throw new Error('Payment method not found');
    }

    // Unset all other defaults for this company
    await prisma.paymentMethod.updateMany({
      where: { 
        companyId: company.id, 
        id: { not: parseInt(id) },
        isDefault: true 
      },
      data: { isDefault: false },
    });

    // Set this as default
    const updatedPayment = await prisma.paymentMethod.update({
      where: { id: parseInt(id) },
      data: { isDefault: true },
    });

    return this.toPaymentMethodUnion(updatedPayment);
  }

  // Check if payment type exists for company
  async paymentTypeExists(userId: number, type: 'ESEWA' | 'STRIPE'): Promise<boolean> {
    const company = await companyRepository.getCompanyByUser(userId);
    
    const existing = await prisma.paymentMethod.findFirst({
      where: {
        companyId: company.id,
        type: type,
      },
    });

    return !!existing;
  }

  // Get default payment method for company
  async getDefaultPayment(userId: number): Promise<PaymentMethodUnion | null> {
    const company = await companyRepository.getCompanyByUser(userId);
    
    const payment = await prisma.paymentMethod.findFirst({
      where: { 
        companyId: company.id, 
        isDefault: true 
      },
    });

    return payment ? this.toPaymentMethodUnion(payment) : null;
  }
}

export default new PaymentRepository();