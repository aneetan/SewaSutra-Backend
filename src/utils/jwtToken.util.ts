import dotenv from "dotenv";
import jwt, { SignOptions } from "jsonwebtoken"

dotenv.config();

export const ONE_WEEK_SECONDS = 60 * 60 * 24 * 7;

export const generateJwtToken = (
   payload: string | object | Buffer ,
   expiresIn: SignOptions['expiresIn'] = "1h"
): string => {

   if (!process.env.JWT_SECRET_KEY) {
      throw new Error("JSON_SECRET_KEY is missing in environment variables.");
   }

   return jwt.sign(
      payload,
      process.env.JWT_SECRET_KEY!,
      { expiresIn }
   )
};