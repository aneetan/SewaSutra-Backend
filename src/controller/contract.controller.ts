import { NextFunction, Request, Response } from "express";
import contractRepository from "../repository/contract.repository";
import { generateContractDocument } from "../services/contract.service";
import { CreateProjectFormData } from "../types/contract.type";
import { authMiddleware } from "../middleware/authMiddleware";
import notificationService from "../services/notification.service";
import userRepository from "../repository/user.repository";
import companyRepository from "../repository/company.repository";
import emailService from "../services/email.service";

class ContractRepository {
   createContract = [
      async(req:Request, res: Response, next: NextFunction): Promise<void> => {
         try{
            const data = req.body as CreateProjectFormData;
            
            if (!data.companyId || !data.clientId || !data.requirementId) {
               res.status(400).json({
                  message: "Missing required fields",
               });
            }

            const contract = await contractRepository.createContractTable(data);

            res.status(201).json({
               message: "Contract created successfully",
               contract,
            });
         }  catch (error: any) {
            res.status(500).json({
               message: error.message || "Failed to create contract",
            });
         }
      }
   ]

   acceptContract = [
      async(req:Request, res: Response, next: NextFunction): Promise<void> => {
         try {
            const contractId = Number(req.params.contractId);

            // 1. Activate contract + expire bids
            const contract = await contractRepository.handleContractAcceptance(contractId);
            const client = await userRepository.findById(contract.clientId);
            const company = await companyRepository.getCompanyById(contract.companyId);
            // 2. Generate contract document (PDF)
            const pdfPath = await generateContractDocument(contractId);

            res.status(200).json({
               message: "Contract accepted and document generated",
               pdfPath,
            });
            notificationService.sendContractGenerated(contract.clientId, contractId, contract.projectId, company.name);
            notificationService.sendContractGenerated(contract.companyId, contractId, contract.projectId, client.name);
         } catch (error: any) {
            res.status(500).json({
               message: error.message || "Failed to accept contract",
            });
         }
      }
   ]

   declineContract = [
      async(req:Request, res: Response, next: NextFunction): Promise<void> => {
         try {
            const contractId = Number(req.params.contractId);

            // 1. Activate contract + expire bids
            await contractRepository.declineContractByClient(contractId);

            res.status(200).json({
               message: "Contract declined",
            });
         } catch (error: any) {
            res.status(500).json({
               message: error.message || "Failed to decline contract",
            });
         }
      }
   ]
   

   getContractRequestsForClient  = [
      async(req:Request, res: Response, next: NextFunction): Promise<void> => {
         try {
            const request = req as Request & { userId: string };
            const clientId = Number(request.userId);

            const contracts =await contractRepository.getPendingContractsForClient(clientId);
            res.status(200).json({
               message: "Pending contract requests fetched successfully",
               contracts,
            });

         } catch (error: any) {
            res.status(500).json({
               message: error.message || "Failed to fetch contract requests",
            });
         }
      }
   ]

   getAcceptedContractsForClient  = [
      async(req:Request, res: Response, next: NextFunction): Promise<void> => {
         try {
            const request = req as Request & { userId: string };
            const clientId = Number(request.userId);

            const acceptedContracts =await contractRepository.getAcceptedContractsForClient(clientId);
            res.status(200).json({
               message: "Accepted contract requests fetched successfully",
               data: acceptedContracts,
            });

         } catch (error: any) {
            res.status(500).json({
               message: error.message || "Failed to fetch contract requests",
            });
         }
      }
   ]

   getCompanyPendingContracts = [
      async(req:Request, res: Response, next: NextFunction): Promise<void> => {
         try {
            const request = req as Request & { userId: string };
            const companyId = Number(request.userId);

            const finalQuotes = await contractRepository.getPendingSignatureContractsForCompany(companyId);
               res.status(200).json({
                  message: "final quotes for company fetched successfully",
                  totalContracts: finalQuotes.length,
                  data: finalQuotes,
               });

         } catch (error: any) {
            res.status(500).json({
               message: error.message || "Failed to fetch contract requests",
            });
         }
      }
   ]

   getCompanyProjects = [
      async(req:Request, res: Response, next: NextFunction): Promise<void> => {
         try {
            const request = req as Request & { userId: string };
            const companyId = Number(request.userId);

            const projects = await contractRepository.getProjectsForCompany(companyId);
               res.status(200).json({
                  message: "final quotes for company fetched successfully",
                  totalProjects: projects.length,
                  data: projects,
               });

         } catch (error: any) {
            res.status(500).json({
               message: error.message || "Failed to fetch contract requests",
            });
         }
      }
   ]

}

export default new ContractRepository();