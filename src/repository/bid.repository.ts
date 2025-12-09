import prisma from "../config/dbconfig";
import { BidData, BidRequestData } from "../types/bid.type";

class BidRepository {
   /**
   * Store bid request in database
   */
  async createBidRequest(bid: Omit<BidRequestData, 'id'>): Promise<BidRequestData> {
      const bidRequest =  await prisma.bidRequest.create({
        data: {
          userId: bid.userId,
          companyId: bid.companyId,
          requirementId: bid.requirementId,
          requestedAt: new Date(),
          status: bid.status
        }
      });

      return bidRequest;
  }

   async getBidRequestForCompany(companyId: number): Promise<BidRequestData[]> {
      const bidRequests = await prisma.bidRequest.findMany({
         where: { companyId },
      });

      return bidRequests;
   }

   async getBidRequestFprRequirement(requirementId: number): Promise<BidRequestData[]> {
      const bidRequests = await prisma.bidRequest.findMany({
         where: { requirementId },
      });

      return bidRequests;
   }

   async getRequirementsWithBidRequests(params: {
      companyId: string;
      status?: string;
      page: number;
      limit: number;
   }) {
      const { companyId, status, page, limit } = params;
      const skip = (page - 1) * limit;

      const companyIdNum = parseInt(companyId, 10);
  

      // Build where clause
      const where: any = {
         companyId: companyIdNum,
      };

      if (status) {
         where.status = status;
      }

      try {
         // CORRECT: count() should not have select parameter
         const [requirements, total] = await Promise.all([
            prisma.bidRequest.findMany({
            where,
            include: {
               requirement: true,
               company: true,
            },
            skip,
            take: limit,
            }),
            prisma.bidRequest.count({ where }), // Just pass where, no select!
         ]);

         return {
            requirements,
            pagination: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
            },
         };
      } catch (error: any) {
         console.error('Error in getRequirementsWithBidRequests:', error);
         throw new Error(`Database error: ${error.message}`);
      }
   }

   /**
   * Store quote in company
   */
  async createQuote(bid: Omit<BidData, 'id'>): Promise<BidData> {
      const bidSubmitted =  await prisma.bid.create({
        data: {
          amount: bid.amount,
          deliveryTime: bid.deliveryTime,
          message: bid.message,
          companyId: bid.companyId,
          requirementId: bid.requirementId,
          status: bid.status
        }
      });

      return bidSubmitted;
  }


  /**
   * Get quotes for requirement
   */
  async getQuoteForRequirement(requirementId: number): Promise<BidData[]> {
      const quotesForRequirement =  await prisma.bid.findMany({
         where: { requirementId },
         include: {
            company: {
               select: {
                  id: true,
                  name: true,
                  docs: {
                     select: {
                        logo: true,
                     },
                     take: 1,     // if multiple docs exist, only get the latest or first
                  },
               },
            },
         },
         orderBy: {
            createdAt: "desc",
         },
      });

      return quotesForRequirement.map(q => ({
         ...q,
         company: {
            id: q.company.id,
            name: q.company.name,
            logo: q.company.docs[0]?.logo || null
         }
      }));;
  }

  async acceptQuoteByClient(quoteId: number) {
      return await prisma.bid.update({
         where: { id: quoteId },
         data: {
            status: "ACCEPTED",
         },
         include: {
            company: {
            select: {
               name: true,
            },
            },
            requirement: {
            select: {
               title: true,
               userId: true,   
            },
            },
         },
      });
   }

   async declineQuoteByClient(quoteId: number) {
      return await prisma.bid.update({
         where: { id: quoteId },
         data: {
            status: "DECLINED",
         },
         include: {
            company: {
            select: {
               name: true,
            },
            },
            requirement: {
            select: {
               title: true,
               userId: true,   
            },
            },
         },
      });
   }

   async findBidByCompanyAndRequirement(companyId: number, requirementId: number) {
      return await prisma.bid.findFirst({
         where: {
            companyId,
            requirementId
         },
         select: {
            id: true,
            status: true,
            amount: true,
            createdAt: true,
            updatedAt: true
         }
      });
   };



}

export default new BidRepository();