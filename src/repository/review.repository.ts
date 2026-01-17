import { Review } from "@prisma/client";
import prisma from "../config/dbconfig";
import { ReviewPayload } from "../types/review.types";

class ReviewRepository {

   async createReview(userData: Omit<ReviewPayload, "id">): Promise<Review> {
      const {rating, comment, companyId, clientId} = userData;

      return await prisma.review.create({
         data: {
            rating,
            comment,
            companyId,
            clientId,
         }
      });
   }

   async updateReview(reviewId: number, clientId: number, data: {
      rating?: number;
      comment?: string;
   }) {
      return  prisma.review.update({
         where: { id: reviewId },
         data,
      });
   }

   async deleteReview(reviewId: number) {
      return  prisma.review.update({
         where: { id: reviewId },
         data: { deletedAt: true }
      });
   }

   async findReviewByCompany (companyId: number) {
      return prisma.review.findMany({
         where: { companyId, deletedAt: false },
         include: {
            client: { select: { id: true, name: true, profile: true } },
         },
         orderBy: { createdAt: "desc" },
      });
   }

   async findReviewByClient(clientId: number) {
      return prisma.review.findMany({
         where: { clientId, deletedAt: false },
         orderBy: { createdAt: "desc" },
      });
   }
}

export default new ReviewRepository();