import { Router } from "express";
import bidController from "../controller/bid.controller";
import requirementController from "../controller/requirement.controller";
import { authMiddleware } from "../middleware/authMiddleware";
import authController from "../controller/auth.controller";
import companyController from "../controller/company.controller";

const clientRouter = Router();

clientRouter.use(authMiddleware)

clientRouter.post('/requirement/create', requirementController.createRequirement);

clientRouter.get('/:requirementId/similar-companies', requirementController.findMatchingCompanies);
clientRouter.get('/requirement', requirementController.getRequirementForUser);

clientRouter.post('/request-bid', bidController.createBidRequestWithNotification)
clientRouter.get('/:requirementId/bid', bidController.getBidRequestForRequirement)
// GET /api/bid-requests/check?clientId=1&companyId=2&requirementId=5
clientRouter.get("/bid-requests/check", bidController.checkBidExists);

clientRouter.get('/quote', bidController.getQuoteForRequirement)
clientRouter.put('/accept-quote/:quoteId', bidController.acceptQuoteByClient)
clientRouter.put('/decline-quote/:quoteId', bidController.declineQuoteByClient)

clientRouter.patch('/profile/edit', authController.updateUser )
clientRouter.get('/profile', authController.getUser )

clientRouter.get("/getPayments", requirementController.getClientPayments);

clientRouter.get("/project-stats", requirementController.getClientDashboardStats);

clientRouter.patch("/requirement/update/:id", requirementController.updateRequirement);
clientRouter.delete("/requirement/delete/:id", requirementController.deleteRequirement);




export default clientRouter;