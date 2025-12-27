import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import esewaController from "../controller/esewa.controller";

const paymentRouter = Router();
paymentRouter.use(authMiddleware);

// Only protect initiation with auth; callbacks and redirect must be public so Esewa can reach them
paymentRouter.post("/esewa/initiate", esewaController.initiate);
paymentRouter.post("/esewa/payment-status", esewaController.verifyPayment);

export default paymentRouter;