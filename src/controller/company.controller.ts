import { NextFunction, Request, Response } from "express";
import { validateSchema } from "../middleware/validateSchema";
import { CompanyInput, CompanySchema } from "../schemas/company.schema";
import { requireCompany } from "../middleware/validateRole";
import { verifyAccessToken } from "../middleware/verifyAccessToken";
import companyRepository from "../repository/company.repository";
import { errorResponse } from "../helpers/errorMsg.helper";
import { parseJSONField } from "../helpers/parseJsonField";
import { webhookService } from "../services/embedding/webhook.services";
import { resendOTPSchema } from "../schemas/otp.schema";

class CompanyController {
   createCompany = [
      validateSchema(CompanySchema),
      verifyAccessToken,
      requireCompany,
      
      async(req:Request<{}, {}, CompanyInput>, res: Response, next: NextFunction): Promise<void> => {
         try {
            const companyInfo = parseJSONField(req.body.companyInfoSchema);
            const servicePricing = parseJSONField(req.body.servicePricingSchema);
            const docs = parseJSONField(req.body.docsValidationSchema);

            if (!companyInfo || !servicePricing) {
               res.status(400).json({
                  success: false,
                  message: "Missing required company data",
               });
               return;
            }

            const processedServicePricing = {
            ...servicePricing,
            priceRangeMin: Number(servicePricing.priceRangeMin),
            priceRangeMax: Number(servicePricing.priceRangeMax)
         };
      
         const formData = {
         ...companyInfo,
         ...processedServicePricing,
         ...docs,
         userId: req.body.userId
         };

         const result = await companyRepository.registerCompany(formData);

         //Trigger embedding generation in background
         webhookService.processNewCompany(result.company.id, result.company);

            res.status(201).json({
               success: true,
               message: "Company registered successfully",
               data: {
                  companyId: result.company.id,
                  companyName: result.company.name,
                  registrationNo: result.company.registrationNo
               },
            });

         } catch (e) {
            errorResponse(e, res, "Error while creating company profile");
            next(e);
         }

      }
   ]

   getCompanyProfile = [
      async(req:Request, res: Response, next: NextFunction): Promise<void> => {
         const companyId = Number(req.params.companyId);
         const company = await companyRepository.getCompanyProfileById(companyId);

         if (!company) {
            res.status(404).json({ message: "Company not found" });
         }

         const response = {
               companyInfo: {
                  name: company.name,
                  registrationNo: company.registrationNo,
                  description: company.description,
                  establishedYear: company.establishedYear,
                  serviceCategory: company.serviceCategory,
                  websiteUrl: company.websiteUrl,
               },
               servicePricing: {
                  servicesOffered: company.services.map((s: any) => s.service),
                  priceRangeMin: company.priceRangeMin,
                  priceRangeMax: company.priceRangeMax,
                  avgDeliveryTime: company.avgDeliveryTime,
               },
               logo: company.docs?.[0]?.logo,
               status: company.user.status
            };
         res.status(201).json(response);
      }
   ]

   hasCompanyData = [
      async(req:Request, res: Response, next: NextFunction): Promise<void> => {
         const request = req as Request & { userId: string };
         const userId = Number(request.userId);

         const isCompany = await companyRepository.isCompanyUser(userId);
         res.status(201).json({ isCompany });
      }
   ]



}

export default new CompanyController;
