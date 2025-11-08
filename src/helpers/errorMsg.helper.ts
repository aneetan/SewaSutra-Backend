import { Response } from "express";

export const errorResponse=  (e: unknown, res:Response, customMessage: string) => {
   const errorMessage = e instanceof Error ? e.message : customMessage;
   res.status(400).json({"message": errorMessage}); 
}