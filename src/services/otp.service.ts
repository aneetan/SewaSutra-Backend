import otpGenerator from 'otp-generator';
import jwt from "jsonwebtoken";
import { generateJwtToken } from '../utils/jwtToken.util';
import { redis } from '../config/redis.config';

export interface OTPPayload{
   email : string,
   otp: string,
   purpose: 'password_reset' | 'email_verification';
}

export class OTPService {
   private static OTP_EXPIRY = 2 * 60;

   static generateOTP(length: number = 6): string {
      return otpGenerator.generate(length, {
         digits: true,
         lowerCaseAlphabets: false,
         upperCaseAlphabets: false,
         specialChars: false,
      });
   }

   static generateOTPToken(payload: OTPPayload): string {
      return generateJwtToken(payload, '15m');
   }

   static verifyOTPToken (token: string) : OTPPayload {
      return jwt.verify(token, process.env.JWT_SECRET_KEY!) as OTPPayload;
   }

   static async storeOTP(email: string, otp: string): Promise<void> {
      const key = `otp:${email}`;
      await redis.setex(key, this.OTP_EXPIRY, otp);
   }

   static async verifyOTP(email: string, otp: string): Promise<boolean> {
      const key = `otp:${email}`;
      const storedOTP = await redis.get(key);

      if (!storedOTP) {
         return false;
      }

      const isValid = storedOTP === otp;

      // Remove OTP after verification (one-time use)
      if (isValid) {
         await redis.del(key);
      }
      return isValid;
   }

   static async getStoredOTP(email: string): Promise<string | null> {
      const key = `otp:${email}`;
      return await redis.get(key);
   }

   static async isOTPExpired(email: string): Promise<boolean> {
      const key = `otp:${email}`;
      const ttl = await redis.ttl(key);
      return ttl === -2; // -2 means key doesn't exist
   }

   static async getOTPExpiry(email: string): Promise<number> {
      const key = `otp:${email}`;
      return await redis.ttl(key); // ttl in seconds
   }

   static async deleteOTP(email: string): Promise<void> {
      const key = `otp:${email}`;
      await redis.del(key);
   }

   static async resendOTP(email: string): Promise<string> {
      // Delete existing OTP
      await this.deleteOTP(email);
      
      // Generate new OTP
      const newOTP = this.generateOTP();
      await this.storeOTP(email, newOTP);
      
      return newOTP;
   }

   static async getOTPStatus(email: string): Promise<{exists: boolean; expiresIn: number; isExpired: boolean;}> {
    const exists = await redis.exists(`otp:${email}`);
    const expiresIn = await this.getOTPExpiry(email);
    const isExpired = expiresIn === -2;

    return {
      exists: exists === 1,
      expiresIn,
      isExpired,
    };
  }


}