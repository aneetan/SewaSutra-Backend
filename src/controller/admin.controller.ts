import { Request, Response, NextFunction } from "express";
import prisma from "../config/dbconfig";
import companyController from "./company.controller";
import companyRepository from "../repository/company.repository";
import projectRepository from "../repository/project.repository";
import { errorResponse } from "../helpers/errorMsg.helper";
import paymentRepository from "../repository/payment.repository";

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

   getAllCompanies = [
      async (req: Request, res: Response, next: NextFunction) => {
         try {
            const companies = await companyRepository.getAllCompanies();

            res.status(200).json({
               message: "Company data found",
               data: companies,
            });
         } catch (error) {
            next(error);
         }
      } 
   ]

   getProjectsByCompanyId = [
      async (req: Request, res: Response, next: NextFunction): Promise<void> => {
         try {
            const companyId = Number(req.params.companyId);

            if (!companyId) {
               res.status(400).json({ message: "Invalid company id" });
               return;
            }

            const projects = await projectRepository.getAllProjectsByCompanyId(
               companyId
            );

            res.status(200).json({
               message: "Projects fetched successfully",
               data: projects,
            });
         } catch (e) {
            errorResponse(e, res, "Error fetching projects");
            next(e);
         }
      },
   ];

   getPaymentsByCompanyId = [
      async (req: Request, res: Response, next: NextFunction): Promise<void> => {
         try {
            const companyId = Number(req.params.companyId);

            if (!companyId) {
               res.status(400).json({ message: "Invalid company id" });
               return;
            }

            const payment = await paymentRepository.getAllPaymentsByCompanyId(
               companyId
            );

            res.status(200).json({
               message: "Payment fetched successfully",
               data: payment,
            });
         } catch (e) {
            errorResponse(e, res, "Error fetching projects");
            next(e);
         }
      },
   ];

}

export default new AdminController;