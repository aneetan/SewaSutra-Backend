import { NextFunction, Request, Response } from "express";
import { RequirementAttribute } from "../types/requirement.types";
import requirementRepository from "../repository/requirement.repository";
import { errorResponse } from "../helpers/errorMsg.helper";
import { verifyAccessToken } from "../middleware/verifyAccessToken";
import { requireClient, requireCompany } from "../middleware/validateRole";
import { webhookService } from "../services/embedding/webhook.services";
import { ProjectAttributes } from "../types/company/project.types";
import projectRepository from "../repository/project.repository";
import { authMiddleware } from "../middleware/authMiddleware";

class ProjectController {
   createProject = [
      verifyAccessToken,
      requireCompany,
      async(req:Request<{}, {}, ProjectAttributes>, res: Response, next: NextFunction): Promise<void> => {
         try {
            const projectDto = req.body;

            const projectData = {
               title: projectDto.title,
               description: projectDto.description,
               completionDate: projectDto.completionDate,
               projectUrl: projectDto.projectUrl,
               imageUrl: projectDto.imageUrl,
            }

            const newProject = await projectRepository.createProject(projectDto.userId, projectData);

            res.status(200).json({
               message: "Project created",
               body: newProject
            })

         } catch (e) {
            errorResponse(e, res, "Error while registering to user");
            next(e); 
         }
      }
   ];

   getProjects = [
      authMiddleware,
      verifyAccessToken,
      requireCompany,
      async (req: Request, res: Response, next: NextFunction): Promise<void> => {
         try {
            const request = req as Request & { userId: string };
            const userId = Number(request.userId);

            // Get the company of the user first
            const companyProjects = await projectRepository.getAllProjects(userId);

            res.status(200).json({
            message: "Projects fetched successfully",
            body: companyProjects,
            });
         } catch (e) {
            errorResponse(e, res, "Error fetching projects");
            next(e);
         }
      },
   ];

}

export default new ProjectController;
