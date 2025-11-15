import { NextFunction, Request, Response } from "express";
import { validateSchema } from "../middleware/validateSchema";
import { CompanyInput, CompanySchema } from "../schemas/company.schema";
import { requireCompany } from "../middleware/validateRole";
import { verifyAccessToken } from "../middleware/verifyAccessToken";
import companyRepository from "../repository/company.repository";
import { errorResponse } from "../helpers/errorMsg.helper";
import { parseJSONField } from "../helpers/parseJsonField";

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

}

export default new CompanyController;
