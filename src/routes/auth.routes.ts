import { Router } from "express";
import authController from "../controller/auth.controller";

const authRouter = Router();

authRouter.post('/register', authController.register);
authRouter.post('/verify-otp', authController.verifyOTP);

export default authRouter;