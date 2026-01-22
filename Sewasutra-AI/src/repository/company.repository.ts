import { Company } from "@prisma/client";
import { CreateCompanyData } from "../types/company/company.types";
import prisma from "../config/dbconfig";
interface UpdateCompanyFullProfileDTO {
  companyInfo?: {
    name?: string;
    registrationNo?: string;
    description?: string;
    establishedYear?: string;
    serviceCategory?: string;
    websiteUrl?: string;
  };
  servicePricing?: {
    priceRangeMin?: number;
    priceRangeMax?: number;
    avgDeliveryTime?: string;
    servicesOffered?: string[];
  };
  docs?: {
    logo?: string;
    taxCertificate?: string;
    businessLicense?: string;
    ownerId?: string;
  };
}

class CompanyRepository {
   async registerCompany(data: CreateCompanyData) {
      return await prisma.$transaction(async (tx) => {
         try {
            // 1. Create Main company record
            const company = await tx.company.create({
               data: {
                  name: data.name,
                  registrationNo: data.registrationNo,
                  description: data.description,
                  establishedYear: data.establishedYear,
                  serviceCategory: data.serviceCategory,
                  websiteUrl: data.websiteUrl,
                  priceRangeMax: data.priceRangeMax,
                  priceRangeMin: data.priceRangeMin,
                  avgDeliveryTime: data.avgDeliveryTime,
                  userId: data.userId
               },
            });

            // 2. Create Services Records
            if (data.servicesOffered && data.servicesOffered.length > 0){
               await tx.services.createMany({
                  data: data.servicesOffered.map(service => ({
                     companyId: company.id,
                     service: service.trim()
                  })),
               });
            }

            // 3. Create Company Documents Record
            const companyDocs = await tx.companyDocs.create({
               data: {
                  logo: data.logo,
                  businessLicense: data.businessLicense,
                  taxCertificate: data.taxCertificate,
                  ownerId: data.ownerId,
                  companyId: company.id
               },
            });

            return {
               company,
               services: data.servicesOffered,
               docs: companyDocs
            }

         } catch (e) {
            console.error('Transaction error:', e);
            throw e;
         }
      })
   }

   async getCompanyByUser(userId: number){
      const company = await prisma.company.findFirst({ where: { userId } });
      return company;
   }

   async getCompanyById(id: number){
      const company = await prisma.company.findFirst({ where: { id } });
      return company;
   }

   async getCompanyProfileById(companyId: number) {
      return await prisma.company.findUnique({
         where: { id: companyId },
         include: {
            services: {
            select: {
               service: true,
            },
            },
            docs: {
               select: {
                  logo: true,
                  taxCertificate: true,
                  businessLicense: true,
                  ownerId: true,
               },
            },
            user: {
               select: {
                  status: true,
               }
            }
         },
      });
   }

   async isCompanyUser(userId: number): Promise<boolean> {
      const user = await prisma.user.findUnique({
         where: { id: userId },
         select: {
            role: true,
            companies: {
            select: { id: true },
            take: 1,
            },
         },
      });

      if (!user) return false;

      return user.role === "COMPANY" && user.companies.length > 0;
   }

   async approveCompany(companyId: number) {
      return await prisma.company.update({
         where: {
            id: companyId,
         },
         data: {
            user: {
            update: {
               status: "VERIFIED",
            },
            },
         },
         include: {
            user: true,
         },
      });
   }

   async declineCompany(companyId: number) {
      return await prisma.company.update({
         where: {
            id: companyId,
         },
         data: {
            user: {
            update: {
               status: "DECLINED",
            },
            },
         },
         include: {
            user: true,
         },
      });
   }

   async getAllCompanies () {
      const companies = await prisma.company.findMany({
         orderBy: {
            createdAt: "desc",
         },
         include: {
            user: true,
            docs: true
         }
      });

      return companies;
   }

   async getAllDocsForCompany(companyId: number) {
      const docs = await prisma.companyDocs.findFirst({
         where: { companyId },
      });

      return docs;
   }

   async updateUserStatusPending(userId: number) {
      return prisma.user.update({
         where: { id: userId },
         data: { status: "PENDING" },
      });
   }

   async updateCompanyFullProfile(companyId: number, data: UpdateCompanyFullProfileDTO) {
      try {
         // 1️⃣ Update main company table
         const companyUpdateData: any = {};
         if (data.companyInfo) Object.assign(companyUpdateData, data.companyInfo);
         if (data.servicePricing) {
            const { priceRangeMin, priceRangeMax, avgDeliveryTime } = data.servicePricing;
            if (priceRangeMin !== undefined) companyUpdateData.priceRangeMin = Number(priceRangeMin);
            if (priceRangeMax !== undefined) companyUpdateData.priceRangeMax = Number(priceRangeMax);
            if (avgDeliveryTime !== undefined) companyUpdateData.avgDeliveryTime = avgDeliveryTime;
         }

         const updatedCompany = await prisma.company.update({
            where: { id: companyId },
            data: companyUpdateData,
         });

         // 2️⃣ Update services (delete old, insert new)
         if (data.servicePricing?.servicesOffered) {
            await prisma.services.deleteMany({ where: { companyId } });

            if (data.servicePricing.servicesOffered.length > 0) {
               await prisma.services.createMany({
                  data: data.servicePricing.servicesOffered.map((service) => ({
                     companyId,
                     service: String(service).trim(),
                  })),
               });
            }
         }

         // 3️⃣ Upsert company documents
         if (data.docs) {
            const docsData: any = {};
            if (data.docs.logo !== undefined) docsData.logo = data.docs.logo;
            if (data.docs.businessLicense !== undefined) docsData.businessLicense = data.docs.businessLicense;
            if (data.docs.taxCertificate !== undefined) docsData.taxCertificate = data.docs.taxCertificate;
            if (data.docs.ownerId !== undefined) docsData.ownerId = data.docs.ownerId;

            await prisma.companyDocs.upsert({
               where: { companyId },
               update: docsData,
               create: { ...docsData, companyId },
            });
         }

         return updatedCompany;
      } catch (e) {
         console.error('Update company profile error:', e);
         throw e;
      }
   }

   async getTopCompaniesByRating()  {
       const companies = await prisma.company.findMany({
         select: {
            id: true,
            name: true,
            description: true,
            serviceCategory: true,
            services: true,
            docs: {
               select: {
                  logo: true
               }
            },
            user: {
            select: {
               email: true,
            },
            },
            contracts: {
            select: {
               id: true,
            },
            },
            review: {
            select: {
               rating: true,
            },
            },
         },
      });

  // calculate total projects + average rating
  const formatted = companies.map((company) => {
    const totalProjects = company.contracts.length;

    const averageRating =
      company.review.length > 0
        ? company.review.reduce((sum, r) => sum + r.rating, 0) /
          company.review.length
        : 0;

    return {
      id: company.id,
      name: company.name,
      logo: company.docs[0].logo,
      serviceCategory: company.serviceCategory,
      bio: company.description,
      email: company.user.email,
      skills: company.services,
      totalProjects,
      rating: Number(averageRating.toFixed(1)),
    };
  });

  // sort by rating DESC and take top 6
  return formatted
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 6);

   }

}

export default new CompanyRepository();