import { Router } from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import esewaController from "../controller/esewa.controller";
import stripeController from "../controller/stripe.controller";

const paymentRouter = Router();
paymentRouter.use(authMiddleware);

// Only protect initiation with auth; callbacks and redirect must be public so Esewa can reach them
paymentRouter.post("/esewa/initiate", esewaController.initiate);
paymentRouter.post("/esewa/payment-status", esewaController.verifyPayment);

paymentRouter.post("/stripe/create-payment-intent", stripeController.createPaymentIntent);

export default paymentRouter;