import { Router } from "express";
import contractController from "../controller/contract.controller";
import { authMiddleware } from "../middleware/authMiddleware";

const contractRouter = Router();

contractRouter.use(authMiddleware);

contractRouter.post("/create", contractController.createContract)
contractRouter.post('/:contractId/accept', contractController.acceptContract);
contractRouter.get('/client/request', contractController.getContractRequestsForClient);
contractRouter.post('/:contractId/decline', contractController.declineContract);
contractRouter.post('/projects', contractController.getAcceptedContractsForClient);



export default contractRouter;