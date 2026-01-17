import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import adminController from "../controller/admin.controller";
import esewaController from "../controller/esewa.controller";

const adminRouter = Router();
adminRouter.use(authMiddleware);

adminRouter.patch("/company/:companyId/approve", adminController.approveCompany);
adminRouter.patch("/company/:companyId/decline", adminController.declineCompany);
adminRouter.get("/companies", adminController.getAllCompanies);
adminRouter.get("/companies/:companyId/projects", adminController.getProjectsByCompanyId);
adminRouter.get("/companies/:companyId/payments", adminController.getPaymentsByCompanyId);
adminRouter.get("/companies/:companyId/docs", adminController.getDocsByCompanyId);
adminRouter.get("/payments", esewaController.getAllPayments);
adminRouter.get("/clients", adminController.getAllClients);
adminRouter.get("/projects", adminController.getAllAcceptedContracts);
adminRouter.get("/project-stats", adminController.getProjectStats);
adminRouter.get("/payment-stats", adminController.getPaymentStatus);
adminRouter.get("/quotation-stats", adminController.getQuotationStats);
adminRouter.get("/company-stats", adminController.getRegisteredCompanies);

export default adminRouter;