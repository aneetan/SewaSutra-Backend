import { Router } from "express";
import companyController from "../controller/company.controller";
import projectController from "../controller/project.controller";
import paymentController from "../controller/payment.controller";
import bidController from "../controller/bid.controller";
import { authMiddleware } from "../middleware/authMiddleware";

const companyRouter = Router();

companyRouter.use(authMiddleware);


companyRouter.post('/create', companyController.createCompany);
companyRouter.get('/:companyId/profile', companyController.getCompanyProfile)

//Projects
companyRouter.post('/add-project', projectController.createProject)
companyRouter.get('/projects', projectController.getProjects)

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

export default companyRouter;