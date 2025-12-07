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
}

export default new BidRepository();