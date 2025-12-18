import { Router } from "express";
import contractController from "../controller/contract.controller";

const contractRouter = Router();

contractRouter.post("/create", contractController.createContract)
contractRouter.post('/:contractId/accept', contractController.acceptContract);

export default contractRouter;