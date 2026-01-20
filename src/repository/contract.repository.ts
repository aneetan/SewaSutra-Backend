import prisma from "../config/dbconfig";
import { ContractWithRelations, CreateProjectFormData } from "../types/contract.type";
import { generateProjectId } from "../utils/projectId.util";
import companyRepository from "./company.repository";

class ContractRepository {
   /**
   * Store contract in database
   */
  async createContractTable(data: CreateProjectFormData): Promise<ContractWithRelations> {
      const projectId = generateProjectId();

      const company = companyRepository.getCompanyByUser(data.companyId);

      const newContract = await prisma.contract.create({
        data: {
          projectId,
          serviceType: data.serviceType,
          amount: data.amount,
          advancePercent: data.advancePercent,
          durationDays: data.durationDays,
          defectLiabilityMonths: data.defectLiabilityMonths,
          location: data.location,
          scopeSummary: data.scopeSummary,
          status: 'PENDING_SIGNATURE',
          paymentStatus: 'PENDING',
          companyId: (await company).id,
          clientId: data.clientId,
          requirementId: data.requirementId,
        },
        include: {
          company: true,
          client: true,
          requirement: true,
        }
      })

      return newContract;
  }

   async handleContractAcceptance(contractId: number) {
      const contract = await prisma.contract.findUnique({
        where: { id: contractId },
        include: { requirement: true }
      })

      if (!contract) throw new Error("Contract not found");

      await prisma.$transaction(async (tx) => {
          // 1. Update contract status to ACTIVE
         await tx.contract.update({
            where: { id: contractId },
            data: {
            status: "ACTIVE",
            },
         });

          // 2. Expire all bids related to the same requirement
         await tx.bid.updateMany({
            where: {
            requirementId: contract.requirementId,
            status: {
               not: "ACCEPTED", 
            },
            },
            data: {
               status: "DECLINED",
            },
         });
      })
      return contract;

   }

   async declineContractByClient(contractId: number) {
      return await prisma.contract.update({
         where: { id: contractId },
         data: {
            status: "TERMINATED",
         },
      });
   }  

   async getPendingSignatureContractsForCompany(companyId: number) {
      return await prisma.contract.findMany({
         where: {
            companyId,
            status: "PENDING_SIGNATURE",
         },
         include: {
            requirement: true,
            client: true,
         },
         orderBy: {
            createdAt: "desc",
         },
      });
   }

   async getAllProjectsForCompany(companyId: number) {
      return await prisma.contract.findMany({
         where: {
            companyId,
            status: {
               not: "PENDING_SIGNATURE",
            },
         },
         include: {
            requirement: true,
            client: true,
            company: true
         },
         orderBy: {
            createdAt: "desc",
         },
      });
   }



   async getAcceptedContractsForClient(clientId: number) {
      return await prisma.contract.findMany({
         where: {
            clientId,
            status: {
            in: ["ACTIVE", "COMPLETED"], 
            },
         },
         include: {
            company: {
            select: {
               id: true,
               name: true,
            },
            },
            client: {
            select: {
               id: true,
               name: true,
               email: true,
            },
            },
            requirement: {
            select: {
               id: true,
               title: true,
               description: true,
               category: true,
               workType: true
            },
            },
         },
         orderBy: {
            createdAt: "desc",
         },
      });
   }


   async getPendingContractsForClient(clientId: number) {
      return await prisma.contract.findMany({
         where: {
            clientId,
            status: "PENDING_SIGNATURE",
         },
         include: {
            company: true,
            requirement: true,
         },
         orderBy: {
            createdAt: "desc",
         },
      });
   }

   async updatePaymentForContract(contractId: number) {
      // Fetch the contract
      const contract = await prisma.contract.findUnique({
         where: { id: contractId },
      });

      if (!contract) throw new Error("Contract not found");

      // Decide new status
      let newPaymentStatus : "PARTIALLY_PAID" | "FULLY_PAID";
      let newContractStatus= contract.status;

      if (contract.paymentStatus === "PENDING") {
         newPaymentStatus  = "PARTIALLY_PAID";
      } else if(contract.paymentStatus === "PARTIALLY_PAID") {
         newPaymentStatus  = "FULLY_PAID";
         newContractStatus = "COMPLETED";
      }

      // Update contract status
      const updatedContract = await prisma.contract.update({
         where: { id: contractId },
         data: {
            paymentStatus: newPaymentStatus,
            status: newContractStatus,
            updatedAt: new Date(),
         },
      });


      return updatedContract;
   }

   async getAllAcceptedContracts() {
    return await prisma.contract.findMany({
      where: {
        status: "ACTIVE", 
      },
      include: {
        requirement: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            user: true
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }

  async getAllProjects() {
    return await prisma.contract.findMany({
      include: {
        requirement: {
          select: {
            id: true,
            title: true,
            description: true,
          },
        },
        company: {
          select: {
            id: true,
            name: true,
            user: true
          },
        },
        client: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        payment: {
          select: {
            id: true,
            amount: true,
            status: true,
            createdAt: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });
  }




}

export default new ContractRepository();