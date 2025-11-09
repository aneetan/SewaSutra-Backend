import { NextFunction, Request, Response } from "express";
import { validateSchema } from "../middleware/validateSchema";
import { LoginUserInput, loginUserSchema, RegisterUserInput, registerUserSchema } from "../schemas/user.schema";
import userRepository from "../repository/user.repository";
import bcrypt from 'bcryptjs';
import { OTPService } from "../services/otp.service";
import emailService from "../services/email.service";
import { errorResponse } from "../helpers/errorMsg.helper";
import { ResendOTPInput, resendOTPSchema, VerifyOTPInput, verifyOTPSchema } from "../schemas/otp.schema";
import { redis } from "../config/redis.config";
import { generateJwtToken } from "../utils/jwtToken.util";

class AuthController {
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
               res.status(409).json({message: "Email already in use"});
            };

            //hash password
            const hashedPassword =  await bcrypt.hash(userDto.password, 12);

            const userData = {
               name: userDto.name,
               email: userDto.email,
               role: userDto.role,
               address: userDto.address,
               phone: userDto.phone,
               password: hashedPassword,
               status: userDto.status,
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

            await emailService.sendOTPEmail(email, otp, newUser.name);

            res.status(200).json({
               message: "OTP sent to email",
               token: otpToken,
               email: email
            })

         } catch (e) {
            errorResponse(e, res, "Error while registering to user");
            next(e); 
         }
      }
   ];

   verifyOTP =[
      validateSchema(verifyOTPSchema),
      async (req: Request<{}, {}, VerifyOTPInput>, res: Response, next: NextFunction) => {
         try{
            const {email, otp, token} = req.body;

            let isValid= false;
            if(token) {
               try{
                  const payload = OTPService.verifyOTPToken(token);
                  isValid = payload.otp === otp && payload.email === email;
               } catch {
                  isValid = false;
               }
            }

            if (!isValid) {
               // Also try Redis verification as fallback
               isValid = await OTPService.verifyOTP(email, otp);
            }

            if (!isValid) {
               throw new Error('Invalid or expired OTP');
            }

            await userRepository.updateVerificationStatus(email);

            res.status(200).json({
               message: 'OTP verified successfully',
            });
            
         } catch (e) {
            errorResponse(e, res, "Invalid or expired OTP");
            next(e);
         }
      }
   ];

   resendOtp = [
      validateSchema(resendOTPSchema),
      async (req: Request<{}, {}, ResendOTPInput>, res: Response, next: NextFunction) => {
         try {
            const {email, token} = req.body;

            const user = await userRepository.findByEmail(email);
            if (!user) return res.status(404).json({ message: 'User not found with this email address.'});

            if(token) {
               try{
                  const payload = OTPService.verifyOTPToken(token);
                  if (payload.email !== email){
                     return res.status(401).json({
                        success: false,
                        message: 'Invalid token for this email address.'
                     });
                  }
               }  catch (error) {
                  return res.status(401).json({
                     success: false,
                     message: 'Invalid or expired token.'
                  });
               }
            }

            const otp = await OTPService.resendOTP(email);

            await emailService.sendOTPEmail(email, otp, user.name);

            res.status(200).json({
               message: "OTP sent to email",
               token: token,
               email: email
            })


         } catch(e) {

         }
      }
   ]

   login = [
      validateSchema(loginUserSchema),
      async(req: Request<{}, {}, LoginUserInput>, res: Response, next: NextFunction) => {
         try{
            const {email, password} = req.body;

            const user = await userRepository.findEmailAndPassword(email, password);
            if (!user) {
               return res.status(401).json({error : "Authentication failed"});
            }

            // Check if email is verified
            if (!user.emailVerified) {
               return res.status(403).json({
                  error: "Email not verified",
                  message: "Please verify your email before logging in",
                  userId: user.id
               });
            }

            const accessToken = generateJwtToken({user}, '1h');
            await redis.set(`accessToken:${user.id}`, accessToken, "EX", 60 * 60);

            res.status(200).json({
               "message": "User logged in successfully",
               accessToken,
               id: user.id
            });  
            
         } catch (e) {
            errorResponse(e, res, "Invalid email or password");
            next(e);
         }
      } 
   ]

}

export default new AuthController;