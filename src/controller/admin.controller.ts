import { Request, Response, NextFunction } from "express";
import companyRepository from "../repository/company.repository";
import projectRepository from "../repository/project.repository";
import { errorResponse } from "../helpers/errorMsg.helper";
import paymentRepository from "../repository/payment.repository";
import notificationService from "../services/notification.service";
import emailService from "../services/email.service";
import userRepository from "../repository/user.repository";
import contractRepository from "../repository/contract.repository";
import dashboardRepository from "../repository/dashboard.repository";
import { webhookService } from "../services/embedding/webhook.services";

class AdminController {
   approveCompany = [
      async (req: Request, res: Response, next: NextFunction) => {
         try {
            const companyId = Number(req.params.companyId);
            const user = userRepository.getUserByCompanyId(companyId);

            if (!companyId) {
               return res.status(400).json({ message: "Invalid company id" });
            }

            const company = await companyRepository.approveCompany(companyId);

            // Trigger embedding generation/update in background
            // If company embeddings already exist in Pinecone, they will be updated
            webhookService.processNewCompany(company.id, company);

            res.status(200).json({
               message: "Company approved and user verified",
               data: company,
            });
            notificationService.sendCompanyApproved((await user).id, company.name);
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
            emailService.sendCompanyApprovedEmail(company.user.email, company.name)
            notificationService.sendCompanyDeclined(companyId, company.name);
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

   getDocsByCompanyId = [
      async (req: Request, res: Response, next: NextFunction): Promise<void> => {
         try {
            const companyId = Number(req.params.companyId);

            if (!companyId) {
               res.status(400).json({ message: "Invalid company id" });
               return;
            }

            const docs = await companyRepository.getAllDocsForCompany(
               companyId
            );

            res.status(200).json({
               message: "Payment fetched successfully",
               data: docs,
            });
         } catch (e) {
            errorResponse(e, res, "Error fetching projects");
            next(e);
         }
      },
   ];

   getAllClients = [
      async (req: Request, res: Response, next: NextFunction): Promise<void> => {

      try {
         const clients = await userRepository.getAllClients();

         res.status(200).json({
            success: true,
            message: "Clients fetched successfully",
            data: clients,
         });
      } catch (error) {
         console.error("Get clients error:", error);
         res.status(500).json({
            success: false,
            message: "Failed to fetch clients",
         });
      }
      }
   ]

   getAllAcceptedContracts =[
      async (req: Request, res: Response, next: NextFunction): Promise<void> => {
         try {
            const contracts = await contractRepository.getAllProjects();

            res.status(200).json({
               success: true,
               message: "Accepted contracts retrieved successfully",
               data: contracts,
            });
         } catch (error) {
            console.error("Error fetching accepted contracts:", error);
            res.status(500).json({
            success: false,
            message: "Failed to fetch accepted contracts",
            });
         }
      }
   ]


   getProjectStats =[
      async (req: Request, res: Response, next: NextFunction): Promise<void> => {
         try {
            const stats = await dashboardRepository.getProjectStats();

            res.status(200).json({
               success: true,
               message: "Project statistics fetched successfully",
               data: stats,
            });
         } catch (error) {
            console.error("Dashboard stats error:", error);
            res.status(500).json({
               success: false,
               message: "Failed to fetch project statistics",
            });
         }
      }
   ]

   getPaymentStatus = [
      async (req: Request, res: Response, next: NextFunction): Promise<void> => {
         try {
      const stats = await dashboardRepository.getPaymentStats();
      res.status(200).json({
        success: true,
        message: "Payment stats retrieved successfully",
        data: stats,
      });
    } catch (error) {
      console.error("Dashboard stats error:", error);
      res.status(500).json({
        success: false,
        message: "Failed to fetch payment stats",
      });
    }
      }
   ]

   getQuotationStats =[
      async (req: Request, res: Response, next: NextFunction): Promise<void> => {
         try {
            const stats = await dashboardRepository.getQuotationStats();
            res.status(200).json({ success: true, data: stats });
         } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Failed to get quotation stats" });
         }
      }
   ]

   getRegisteredCompanies =[
      async (req: Request, res: Response, next: NextFunction): Promise<void> => {
         try {
            const stats = await dashboardRepository.getAllCompanies();
            res.status(200).json({ success: true, data: stats });
         } catch (error) {
            console.error(error);
            res.status(500).json({ success: false, message: "Failed to get quotation stats" });
         }
      }
   ]
}

export default new AdminController;