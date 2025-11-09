import { Router } from "express";
import authController from "../controller/auth.controller";

const authRouter = Router();

authRouter.post('/register', authController.register);
authRouter.post('/verify-otp', authController.verifyOTP);
authRouter.post('/resend-otp', authController.resendOtp);


export default authRouter;