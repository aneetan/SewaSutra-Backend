import { NextFunction, Request, Response } from "express";
import { RequirementAttribute } from "../types/requirement.types";
import requirementRepository from "../repository/requirement.repository";
import { errorResponse } from "../helpers/errorMsg.helper";
import { verifyAccessToken } from "../middleware/verifyAccessToken";
import { requireClient } from "../middleware/validateRole";
import { webhookService } from "../services/embedding/webhook.services";
import { authMiddleware } from "../middleware/authMiddleware";
import { success } from "zod";
import { esewaRepository } from "../repository/esewa.repository";
import dashboardRepository from "../repository/dashboard.repository";

class RequirementController {
   createRequirement = [
      authMiddleware,
      requireClient,
      async(req:Request<{}, {}, RequirementAttribute>, res: Response, next: NextFunction): Promise<void> => {
         try {
            const requirementDto = req.body;

            const requirementData = {
               title: requirementDto.title,
               description: requirementDto.description,
               workType: requirementDto.workType,
               minimumBudget: requirementDto.minimumBudget,
               maximumBudget: requirementDto.maximumBudget,
               category: requirementDto.category,
               timeline: requirementDto.timeline,
               skills: requirementDto.skills,
               attachment: requirementDto.attachment,
               urgency: requirementDto.urgency,
               userId: requirementDto.userId
            }

            const newRequirement = await requirementRepository.createRequirement(requirementData);

            //Trigger embedding generation in background
            webhookService.processNewRequirement(newRequirement.id, requirementData);

            res.status(200).json({
               message: "Requirement created",
               data: newRequirement
            })

         } catch (e) {
            errorResponse(e, res, "Error while registering to user");
            next(e); 
         }
      }
   ];

   getRequirementForUser = [
      authMiddleware,
      requireClient,
      async(req: Request, res: Response, next: NextFunction): Promise<void> => {
         try {
            const request = req as Request & { userId: string };
            const userId = Number(request.userId);

            if (!userId) {
               res.status(400).json({
                  success: false,
                  error: "userId is required"
               });
               return;
            }

            const requirements = await requirementRepository.getRequirementByUserId(userId);

            res.status(200).json({
               success: true,
               requirements: requirements
            });

         } catch (e) {
            errorResponse(e, res, "Error getting requirement for userId");
            next(e);
         }
      }
   ];

    // Find matching companies for a requirement
   findMatchingCompanies = [
      async(req: Request, res: Response, next: NextFunction): Promise<void> => {
         try {
            const { requirementId } = req.params;
            const { topK = 5 } = req.query;

            if (!requirementId) {
               res.status(400).json({
                  success: false,
                  error: "requirementId is required"
               });
               return;
            }

            const matches = await webhookService.findCompaniesForRequirement(
               parseInt(requirementId), 
               parseInt(topK as string)
            );

            res.status(200).json({
               success: true,
               requirementId: parseInt(requirementId),
               matches: matches,
               totalMatches: matches.length
            });

         } catch (e) {
            errorResponse(e, res, "Error finding matching companies");
            next(e);
         }
      }
   ];

   getClientPayments = [
         async (req: Request, res: Response) => {
             try {
                const request = req as Request & { userId: string };
               const userId = Number(request.userId);
   
               const payments = await esewaRepository.getPaymentsForClient(userId);
   
               const formatted = payments.map((p) => ({
               id: p.id,
               amount: p.amount,
               commission: p.commission,
               mode: p.gateway,
               status: p.status,
   
               company: {
                  id: p.company.id,
                  name: p.company.name,
                  logo: p.company.docs[0]?.logo || null,
               },
   
               client: {
                  name: p.client.name,
               },
   
               project: {
                  title: p.contract.requirement.title,
               },
               }));
   
               res.status(200).json({
               success: true,
               data: formatted,
               });
            } catch (error) {
               console.error(error);
               res.status(500).json({
               success: false,
               message: "Failed to fetch company payments",
               });
            }
         }
   
      ]

      getClientDashboardStats  = [
         async (req: Request, res: Response) => {
            try {
               const request = req as Request & { userId: string };
               const clientId = Number(request.userId);

               if (!clientId) {
                  return res.status(400).json({ message: "Client ID is required" });
               }

               const stats = await dashboardRepository.getClientStats(clientId);

               res.status(200).json({
                  success: true,
                  data: stats,
               });
            } catch (error) {
               console.error("Client dashboard stats error:", error);
               res.status(500).json({
                  success: false,
                  message: "Failed to load client dashboard statistics",
               });
            }
         }
      ]

      updateRequirement = [
         async (req: Request, res: Response) => {
             try {
               const { id } = req.params;
               const { title, description, attachment } = req.body;

               if (!title || !description) {
                  return res.status(400).json({
                  success: false,
                  message: "Title and description are required",
                  });
               }

               const updatedRequirement = await requirementRepository.updateRequirement(
                  Number(id),
                  { title, description, attachment }
               );

               return res.status(200).json({
                  success: true,
                  message: "Requirement updated successfully",
                  body: updatedRequirement,
               });
            } catch (error) {
               console.error("Update Requirement Error:", error);
               return res.status(500).json({
                  success: false,
                  message: "Failed to update requirement",
               });
            }
         }
      ]

      deleteRequirement = [
         async (req: Request, res: Response) => {
            try {
               const requirementId = Number(req.params.id);

               if (!requirementId) {
                  return res.status(400).json({
                  success: false,
                  message: "Requirement ID is required",
                  });
               }

               await requirementRepository.deleteRequirementWithRelations(requirementId);

               return res.status(200).json({
                  success: true,
                  message: "Requirement and all associated bids & requests deleted successfully",
               });
            } catch (error: any) {
               console.error("Delete Requirement Error:", error);
               return res.status(500).json({
                  success: false,
                  message: "Failed to delete requirement",
               });
            }
         }
      ]


}

export default new RequirementController;
