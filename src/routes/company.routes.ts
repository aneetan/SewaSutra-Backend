import { Router } from "express";
import companyController from "../controller/company.controller";
import projectController from "../controller/project.controller";
import paymentController from "../controller/payment.controller";
import bidController from "../controller/bid.controller";
import { authMiddleware } from "../middleware/authMiddleware";
import contractController from "../controller/contract.controller";

const companyRouter = Router();

companyRouter.use(authMiddleware);


companyRouter.post('/create', companyController.createCompany);
companyRouter.get('/:companyId/profile', companyController.getCompanyProfile)
companyRouter.patch(
  "/:companyId/full-profile",
  companyController.updateCompanyFullProfile
);


//Projects
companyRouter.post('/add-project', projectController.createProject)
companyRouter.get('/:companyId/projects', projectController.getProjects)

//payment
companyRouter.post('/add-payment', paymentController.createPaymentMethod)
companyRouter.get('/payments', paymentController.getPaymentMethods)

companyRouter.get('/bid-request', bidController.getBidRequestForCompany)

companyRouter.get('/requirements-with-bids', bidController.getRequirementsWithBidRequests);
companyRouter.post('/submit-quote', bidController.submitQuoteRequest);
companyRouter.get('/submitted-quote', bidController.getCompanySubmittedBids);
companyRouter.put('/:bidId/revoke', bidController.revokeBidByCompany);


companyRouter.get('/bid-status/:requirementId', bidController.checkCompanyBidStatus);

//has KYC filled
companyRouter.get('/haskyc', companyController.hasCompanyData)

companyRouter.get('/contracts/pending', contractController.getCompanyPendingContracts)
companyRouter.get('/contract/projects', contractController.getCompanyProjects)

companyRouter.get("/kyc-status", companyController.getKycStatus);
companyRouter.get("/getPayments", companyController.getCompanyPayments);

companyRouter.get("/dashboard-stats", companyController.getCompanyDashboardStats);



export default companyRouter;