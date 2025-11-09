import { NextFunction, Request, RequestHandler, Response } from "express";
import { ZodError, ZodObject } from "zod";

export const validateSchema = (schema: ZodObject): RequestHandler => {
   return async(req: Request, res: Response, next: NextFunction) => {
      try{
         await schema.parseAsync({
            body: req.body,
            query: req.query,
            params: req.params
         });
         next();
         
      } catch(e) {
         if(e instanceof ZodError){
            return res.status(400).json({
               errors: e.issues.map(err => ({
                  path: err.path.join('.'),
                  message: err.message
               }))
            })
         };
         next(e);
      }
   }
}