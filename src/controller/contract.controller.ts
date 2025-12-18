import { NextFunction, Request, Response } from "express";
import contractRepository from "../repository/contract.repository";
import { generateContractDocument } from "../services/contract.service";
import { CreateProjectFormData } from "../types/contract.type";

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

}

export default new ContractRepository();