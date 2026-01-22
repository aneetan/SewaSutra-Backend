import { Request, Response, NextFunction } from "express";
import reviewRepository from "../repository/review.repository";
import { errorResponse } from "../helpers/errorMsg.helper";

class ReviewController {
   createReview = [
      async (req: Request, res: Response, next: NextFunction)  => {
         try{
         const request = req as Request & { userId: string };
         const clientId = Number(request.userId);

         const { rating, comment, companyId, contractId } = req.body;

         const review = await reviewRepository.createReview({
            rating,
            comment,
            clientId,
            companyId,
         });

         res.status(200).json({
            message: "Review added successfully",
            body: review,
         });
         } catch(e) {
            errorResponse(e, res, "Error adding review");
            next(e);
         }
      }
   ]

   updateReview = [
      async (req: Request, res: Response, next: NextFunction)  => {
         try{
            const request = req as Request & { userId: string };
            const clientId = Number(request.userId);

            const reviewId = Number(req.params.id);

            const review = await reviewRepository.updateReview(reviewId, clientId, req.body);

            res.status(200).json({
               message: "Review updated successfully",
               body: review,
            });
         } catch(e) {
            errorResponse(e, res, "Error updating review");
            next(e);
         }
      }
   ]

   deleteReview = [
      async (req: Request, res: Response, next: NextFunction)  => {
         try{
            const request = req as Request & { userId: string };

            const reviewId = Number(req.params.id);

            await reviewRepository.deleteReview(reviewId);

            res.status(200).json({
               message: "Deleted Review",
            });
         } catch(e) {
            errorResponse(e, res, "Error deleting review");
            next(e);
         }
      }
   ]

   getCompanyReviews = [
      async (req: Request, res: Response, next: NextFunction)  => {
         try {
            const request = req as Request & { userId: string };
            const companyId = Number(request.params.companyId);


            const reviews = await reviewRepository.findReviewByCompany(companyId);
            
            res.status(200).json({
               message: "Review fetched successfully",
               data: reviews,
            });

         } catch (e) {
            errorResponse(e, res, "Error fetching review");
            next(e);
         }
      }

   ]
}

export default new ReviewController();