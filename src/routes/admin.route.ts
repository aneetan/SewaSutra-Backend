import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import adminController from "../controller/admin.controller";

const adminRouter = Router();
adminRouter.use(authMiddleware);

adminRouter.patch("/company/:companyId/approve", adminController.approveCompany);
adminRouter.patch("/company/:companyId/decline", adminController.declineCompany);
adminRouter.get("/companies", adminController.getAllCompanies);
adminRouter.get("/companies/:companyId/projects", adminController.getProjectsByCompanyId);
adminRouter.get("/companies/:companyId/payments", adminController.getPaymentsByCompanyId);
adminRouter.get("/companies/:companyId/docs", adminController.getDocsByCompanyId);

export default adminRouter;