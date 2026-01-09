import { Request, Response, NextFunction } from "express";
import prisma from "../config/dbconfig";
import companyController from "./company.controller";
import companyRepository from "../repository/company.repository";

class AdminController {
   approveCompany = [
      async (req: Request, res: Response, next: NextFunction) => {
         try {
            const companyId = Number(req.params.companyId);

            if (!companyId) {
               return res.status(400).json({ message: "Invalid company id" });
            }

            const company = await companyRepository.approveCompany(companyId);

            res.status(200).json({
               message: "Company approved and user verified",
               data: company,
            });
         } catch (error) {
            next(error);
         }
      }   
   ]

   declineCompany = [
      async (req: Request, res: Response, next: NextFunction) => {
         try {
            const companyId = Number(req.params.companyId);

            if (!companyId) {
               return res.status(400).json({ message: "Invalid company id" });
            }

            const company = await companyRepository.declineCompany(companyId);

            res.status(200).json({
               message: "Company declined",
               data: company,
            });
         } catch (error) {
            next(error);
         }
      }   
   ]

}

export default new AdminController;