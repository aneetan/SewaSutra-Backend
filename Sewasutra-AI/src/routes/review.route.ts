import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import reviewController from "../controller/review.controller";

const reviewRouter = Router();

reviewRouter.use(authMiddleware);

reviewRouter.post("/create", reviewController.createReview)
reviewRouter.put("/:id", authMiddleware, reviewController.updateReview);
reviewRouter.delete("/:id", authMiddleware, reviewController.createReview);
reviewRouter.get("/company/:companyId", reviewController.getCompanyReviews);


export default reviewRouter;