import prisma from "../config/dbconfig";

class DashboardRepository {
  async getProjectStats() {
    const [
      total,
      active,
      pending,
      completed,
      cancelled,
    ] = await Promise.all([
      prisma.contract.count(),
      prisma.contract.count({ where: { status: "ACTIVE" } }),
      prisma.contract.count({ where: { status: "PENDING_SIGNATURE" } }),
      prisma.contract.count({ where: { status: "COMPLETED" } }),
      prisma.contract.count({ where: { status: "CANCELLED" } }),
    ]);

    return {
      total,
      active,
      pending,
      completed,
      cancelled,
    };
  }

   async getPaymentStats() {
    // Count completed projects
    const completedProjects = await prisma.contract.count({
      where: { status: "COMPLETED" },
    });

    const totalProjects = await prisma.contract.count();
    const totalContractGenerated = await prisma.contract.count({
      where: {
         status: {
            not: "PENDING_SIGNATURE", // exclude pending signature contracts
         },
      },
   });



    // Count paid projects
    const fullyPaidProjects = await prisma.contract.count({
      where: { paymentStatus: "FULLY_PAID" },
    });

    const partiallyPaidProjects = await prisma.contract.count({
      where: { paymentStatus: "PARTIALLY_PAID" },
    });

    // Count pending projects
    const pendingProjects = await prisma.contract.count({
      where: { paymentStatus: "PENDING" },
    });

    // Total revenue from completed projects
     const revenueAggregate = await prisma.appPayment.aggregate({
         _sum: {
            amount: true,
            commission: true,
         },
         where: { status: "SUCCESS" },
      });

    const totalRevenue = revenueAggregate._sum.amount || 0;

    return {
      totalRevenue,
      completedProjects,
      fullyPaidProjects,
      partiallyPaidProjects,
      pendingProjects,
      totalProjects,
      totalContractGenerated
    }
   }

   async getQuotationStats() {
    // Total quotations
    const total = await prisma.bid.count();

    // Pending quotations
    const pending = await prisma.bid.count({
      where: { status: "PENDING" },
    });

    // Accepted quotations
    const accepted = await prisma.bid.count({
      where: { status: "ACCEPTED" },
    });

     const negotiated = await prisma.bid.count({
      where: { status: "INITIATED" },
    });

    // Declined quotations
    const initiated = await prisma.bid.count({
      where: { status: "FINAL_SUBMITTED" },
    });

     const expired = await prisma.bid.count({
      where: { status: "DECLINED" },
    });

    return {
      total,
      pending,
      accepted,
      initiated,
      negotiated,
      expired,
    };
  }

  async getAllCompanies() {
    // Total quotations
    const registeredCompanies = await prisma.company.count();

    return {
      registeredCompanies
    };
  }

  async getClientStats(clientId: number) {
    const [
      totalProjects,
      completedProjects,
      pendingSignatureProject,
      inProgressProjects,
      pendingQuoteRequest,
      cancelledProject
    ] = await Promise.all([
      prisma.contract.count({
        where: { clientId },
      }),

      prisma.contract.count({
        where: {
          clientId,
          status: "COMPLETED",
        },
      }),

      prisma.contract.count({
        where: {
          clientId,
          status: "PENDING_SIGNATURE",
        },
      }),

      prisma.contract.count({
        where: {
          clientId,
          status: "ACTIVE",
        },
      }),

      prisma.bidRequest.count({
         where: {
            status: "SENT",
            requirement: {
               userId: clientId
            }
         }
      }),

      prisma.contract.count({
        where: {
          clientId,
          status: "CANCELLED",
        },
      }),
    ]);

    return {
      totalProjects,
      completedProjects,
      pendingSignatureProject,
      inProgressProjects,
      pendingQuoteRequest,
      cancelledProject
    };
  }


}

export default new DashboardRepository();
