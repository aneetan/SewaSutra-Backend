import { NextFunction, Request, Response } from "express";
import { validateSchema } from "../middleware/validateSchema";
import { CompanyInput, CompanySchema } from "../schemas/company.schema";
import { requireCompany } from "../middleware/validateRole";
import { verifyAccessToken } from "../middleware/verifyAccessToken";
import companyRepository from "../repository/company.repository";
import { errorResponse } from "../helpers/errorMsg.helper";
import { parseJSONField } from "../helpers/parseJsonField";
import { webhookService } from "../services/embedding/webhook.services";
import notificationService from "../services/notification.service";
import cloudinary from "../config/cloudinary.config";
import userRepository from "../repository/user.repository";
import { esewaRepository } from "../repository/esewa.repository";
import dashboardRepository from "../repository/dashboard.repository";

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
         
         notificationService.sendNewCompanyPendingVerification(3, result.company.id, result.company.name );

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
         docs: {
            logo: company.docs?.[0]?.logo || "",
            taxCertificate: company.docs?.[0]?.taxCertificate || "",
            businessLicense: company.docs?.[0]?.businessLicense || "",
            ownerId: company.docs?.[0]?.ownerId || ""
         },
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

   updateCompanyFullProfile = [
      async (req: Request, res: Response) => {
         try {
            const companyId = Number(req.params.companyId);
            
            // Parse JSON fields if they're sent as strings
            const companyInfo = parseJSONField(req.body.companyInfo);
            const servicePricing = parseJSONField(req.body.servicePricing);
            const docs = parseJSONField(req.body.docs);

            // Validate required data
            if (!companyId || (!companyInfo && !servicePricing && !docs)) {
               return res.status(400).json({
                  success: false,
                  message: "Missing required fields. Provide at least companyInfo, servicePricing, or docs.",
               });
            }

            const updatedCompany = await companyRepository.updateCompanyFullProfile(companyId, {
               companyInfo,
               servicePricing,
               docs, 
            });
            await companyRepository.updateUserStatusPending(updatedCompany.userId);

            res.status(200).json({
               success: true,
               message: "Company profile updated successfully",
               data: updatedCompany,
            });
         } catch (err) {
            console.error("Update company profile error:", err);
            errorResponse(err, res, "Error updating company profile");
         }
      }
   ];


   getKycStatus =[
      async (req: Request, res: Response) => {
          try {
            const request = req as Request & { userId: string };
            const userId = Number(request.userId);
            const user = await userRepository.getUserById(userId);
            const company = await companyRepository.getCompanyByUser(userId);

            const kycStatus = user.status; 

            const canAccessSystem = kycStatus === "VERIFIED";

            let message = "";
            if (kycStatus === "PENDING") {
            message = "Your KYC is not filled yet! Please complete profile setup.";
            } else if (kycStatus === "DECLINED") {
            message = "Your KYC has been declined. Please resubmit your profile.";
            }

            res.status(200).json({
            status: kycStatus,
            canAccessSystem,
            message,
            companyId: company.id
            });
         } catch (e) {
            errorResponse(e, res, "Error fetching KYC status");
         }
      }
   ]

   getCompanyPayments = [
      async (req: Request, res: Response) => {
          try {
             const request = req as Request & { userId: string };
            const userId = Number(request.userId);

            const company = companyRepository.getCompanyByUser(userId);

            const payments = await esewaRepository.getPaymentsByCompany((await company).id);

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
               profile: p.client.profile
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

   getCompanyDashboardStats  = [
      async (req: Request, res: Response) => {
         try {
            const request = req as Request & { userId: string };
            const userId = Number(request.userId);
            const company = await companyRepository.getCompanyByUser(userId);

            if (!company.id) {
               return res.status(400).json({ message: "Company ID is required" });
            }

            const data = await dashboardRepository.getCompanyDashboardStats(company.id);

            res.status(200).json({
               success: true,
               data,
            });
         } catch (error) {
            console.error("Company dashboard error:", error);
            res.status(500).json({
               success: false,
               message: "Failed to load company dashboard statistics",
            });
         }
      }
   ]



}

export default new CompanyController;
