import { NextFunction, Request, Response } from "express";
import contractRepository from "../repository/contract.repository";
import { generateContractDocument } from "../services/contract.service";
import { CreateProjectFormData } from "../types/contract.type";
import { authMiddleware } from "../middleware/authMiddleware";

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
            await contractRepository.handleContractAcceptance(contractId);

            // 2. Generate contract document (PDF)
            const pdfPath = await generateContractDocument(contractId);

            res.status(200).json({
               message: "Contract accepted and document generated",
               pdfPath,
            });
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

}

export default new ContractRepository();