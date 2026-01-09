import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import adminController from "../controller/admin.controller";

const adminRouter = Router();
adminRouter.use(authMiddleware);

adminRouter.patch("/company/:companyId/approve", adminController.approveCompany);
adminRouter.patch("/company/:companyId/decline", adminController.declineCompany);

export default adminRouter;