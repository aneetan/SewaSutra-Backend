import { PaymentType, StatusForPayment } from "@prisma/client";
import prisma from "../config/dbconfig";

class EsewaRepository {
  async createPayment(data: {
    contractId: number;
    clientId: number;
    companyId: number;
    amount: number;
    gateway: PaymentType;
    transactionId: string;
    commission: number,
    companyAmount: number,
    gatewayPayload: any;
    gatewayrefId?: string;
  }) {

     const existingPayment = await prisma.appPayment.findUnique({
        where: {
          transactionId: data.transactionId,
        },
      });

    if (existingPayment) {
        return existingPayment;
    } 
      const status = data.gateway === 'ESEWA' ? StatusForPayment.PENDING : StatusForPayment.SUCCESS;
      return prisma.appPayment.create({
          data: {
            gateway: data.gateway,
            amount: data.amount,
            transactionId: data.transactionId,
            gatewayPayload: data.gatewayPayload,
            contractId: data.contractId,
            clientId: data.clientId,
            companyId: data.companyId,
            commission: data.commission,
            companyAmount: data.companyAmount,
            status: status,
            gatewayRefId: data.gatewayrefId,
            createdAt: new Date(),
            updatedAt: new Date(),
          }
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

  verifyPayment(transactionId: string, refId: string, payload?: any) {
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

  async getAllPayments() {
    return await prisma.appPayment.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        amount: true,
        commission: true,
        gateway: true,          
        status: true,
        createdAt: true,

        company: {
          select: {
            id: true,
            name: true,
            docs: {
              select: {
                logo: true,
              },
            },
          },
        },

        client: {
          select: {
            name: true,
          },
        },

        contract: {
          select: {
            projectId: true,
            requirement: {
              select: {
                title: true,  
              },
            },
          },
        },
      },
    });
  }

  async getPaymentsByCompany(companyId: number) {
    return await prisma.appPayment.findMany({
      where: { companyId },
      orderBy: { createdAt: "desc" },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            docs: { select: { logo: true } },
          },
        },
        client: {
          select: { name: true, profile: true },
        },
        contract: {
          select: {
            requirement: {
              select: {
                title: true, // project name
              },
            },
          },
        },
      },
    });
  }


  async getPaymentsForClient(clientId: number) {
    return await prisma.appPayment.findMany({
      where: { clientId },
      orderBy: { createdAt: "desc" },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            docs: { select: { logo: true } },
          },
        },
        client: {
          select: { name: true },
        },
        contract: {
          select: {
            requirement: {
              select: {
                title: true, // project name
              },
            },
          },
        },
      },
    });
  }



}

export const esewaRepository = new EsewaRepository();
