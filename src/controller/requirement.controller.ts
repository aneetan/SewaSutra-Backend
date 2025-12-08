import { NextFunction, Request, Response } from "express";
import { RequirementAttribute } from "../types/requirement.types";
import requirementRepository from "../repository/requirement.repository";
import { errorResponse } from "../helpers/errorMsg.helper";
import { verifyAccessToken } from "../middleware/verifyAccessToken";
import { requireClient } from "../middleware/validateRole";
import { webhookService } from "../services/embedding/webhook.services";
import { authMiddleware } from "../middleware/authMiddleware";
import { success } from "zod";

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
               body: newRequirement
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
      authMiddleware,
      verifyAccessToken,
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


}

export default new RequirementController;
