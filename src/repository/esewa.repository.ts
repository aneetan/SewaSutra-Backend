import { PaymentType, StatusForPayment } from "@prisma/client";
import prisma from "../config/dbconfig";

class EsewaRepository {
  createPayment(data: {
    contractId: number;
    clientId: number;
    companyId: number;
    amount: number;
    transactionId: string;
    commission: number,
    companyAmount: number,
    gatewayPayload: any;
  }) {
    return prisma.appPayment.create({
      data: {
        gateway: PaymentType.ESEWA,
        amount: data.amount,
        status: StatusForPayment.PENDING,
        transactionId: data.transactionId,
        gatewayPayload: data.gatewayPayload,
        contractId: data.contractId,
        clientId: data.clientId,
        companyId: data.companyId,
        commission: data.commission,
        companyAmount: data.companyAmount,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    });
  }

  findByTransactionId(transactionId: string) {
    return prisma.appPayment.findFirst({
      where: { transactionId },
      include: { contract: true },
    });
  }

  findByPaymentId(paymentId: number) {
    return prisma.appPayment.findFirst({
      where: { id: paymentId },
      include: { contract: true },
    });
  }

  verifyPayment(transactionId: string, refId: string, payload: any) {
    return prisma.appPayment.updateMany({
      where: { transactionId },
      data: {
        status: StatusForPayment.SUCCESS,
        gatewayRefId: refId,
        updatedAt: new Date(),
      },
    });
  }

  markFailed(transactionId: string) {
    return prisma.appPayment.updateMany({
      where: { transactionId },
      data: {
        status: StatusForPayment.FAILED,
        updatedAt: new Date(),
      },
    });
  }
}

export const esewaRepository = new EsewaRepository();
