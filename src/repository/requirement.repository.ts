import { PrismaClient } from "@prisma/client";
import type { Requirement } from "@prisma/client";
import { RequirementAttribute } from "../types/requirement.types";

const prisma = new PrismaClient();

class RequirementRepository {
   async createRequirement(userData: Omit<RequirementAttribute, "id">): Promise<Requirement> {
         const {title, description, workType, minimumBudget, maximumBudget, category, timeline, skills, attachment, urgency, userId} = userData;
   
         return await prisma.requirement.create({
            data: {
               title,
               description,
               workType,
               minimumBudget,
               maximumBudget,
               category,
               timeline,
               skills,
               attachment,
               urgency,
               userId
            }
         });
      }

      async getRequirementById(id: number) {
         return await prisma.requirement.findUnique({
            where: { id },
         });                        
      }

}

export default new RequirementRepository();
