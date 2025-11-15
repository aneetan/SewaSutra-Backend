import { Company } from "@prisma/client";
import { CreateCompanyData } from "../types/company.types";
import prisma from "../config/dbconfig";

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
}

export default new CompanyRepository();