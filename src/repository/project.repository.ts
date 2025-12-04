import { PrismaClient, Project } from "@prisma/client";
import { RequirementAttribute } from "../types/requirement.types";
import { ProjectAttributes } from "../types/company/project.types";
import companyRepository from "./company.repository";

const prisma = new PrismaClient();

class ProjectRepository {
   async createProject(userId: number, userData: Omit<ProjectAttributes, "projectId">): Promise<Project> {
      const {title, description, completionDate, projectUrl, imageUrl} = userData;

      const company = await prisma.company.findFirst({ where: { userId } });

      return await prisma.project.create({
         data: {
            title,
            description,
            completionDate,
            projectUrl,
            imageUrl,
            companyId: company.id
         }
      });
   }

   async getAllProjects(userId?: number): Promise<Project[]> {
      const company = await companyRepository.getCompanyByUser(userId);
      const projects = await prisma.project.findMany({
        where: { companyId: company.id },
        orderBy: { completionDate: "desc" },
      });

      return projects.map(project => ({
        projectId: project.projectId,
        title: project.title,
        description: project.description,
        completionDate: project.completionDate, // Format as YYYY-MM-DD
        projectUrl: project.projectUrl || undefined,
        imageUrl: project.imageUrl || undefined,
        companyId: project.companyId,
        createdAt: project.createdAt,
        updatedAt: project.updatedAt,
      }));
   }  
}

export default new ProjectRepository();
