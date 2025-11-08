import { NextFunction, Request, Response } from "express";
import { validateSchema } from "../middleware/validateSchema";
import { RegisterUserInput, registerUserSchema } from "../schemas/user.schema";
import userRepository from "../repository/user.repository";
import bcrypt from 'bcryptjs';
import { OTPService } from "../services/otp.service";

class UserController {
   register = [
      validateSchema(registerUserSchema),
      async(req:Request<{}, {}, RegisterUserInput>, res: Response, next: NextFunction): Promise<void> => {
         try {
            const userDto = req.body;

            if(userDto.password !== userDto.confirmPassword) {
               throw new Error("Password doesn't match");
            }

            const existingUser = await userRepository.findByEmail(userDto.email);
            if(existingUser) {
               throw new Error("Email already in use")
            };

            //hash password
            const hashedPassword =  await bcrypt.hash(userDto.password, 12);

            const userData = {
               name: userDto.name,
               email: userDto.email,
               role: userDto.role,
               address: userDto.address,
               phone: userDto.address,
               password: hashedPassword,
               emailVerified: false
            }

            const newUser = await userRepository.createUser(userData);
            const email = newUser.email;

            const otp = OTPService.generateOTP();
            OTPService.storeOTP(email, otp);

            const otpToken = OTPService.generateOTPToken({
               email,
               otp,
               purpose: "email_verification"
            });


         }
      }
   ]
}