import { requireClient, requireCompany } from "../middleware/validateRole";
import { NextFunction, Request, Response } from "express";
import { BidData, BidRequestData } from "../types/bid.type";
import bidRepository from "../repository/bid.repository";
import { errorResponse } from "../helpers/errorMsg.helper";
import notificationService from "../services/notification.service";
import requirementRepository from "../repository/requirement.repository";
import companyRepository from "../repository/company.repository";
import { authMiddleware } from "../middleware/authMiddleware";


class BidController {
   createBidRequestWithNotification = [
      authMiddleware,
      requireClient,
      async(req:Request<{}, {}, BidRequestData>, res: Response, next: NextFunction): Promise<void> => {
         try {
            const { userId, companyId, requirementId, userName } = req.body;

            const bidRequest = {
               userId,
               companyId,
               requirementId,
               requestedAt: new Date()
            }

            if (!userId || !companyId || !requirementId) {
               res.status(400).json({ 
                  success: false, 
                  error: 'UserId, requirementId and companyId are required' 
               });
            }

            const newBidRequest = await bidRepository.createBidRequest(bidRequest);

            const notification = await notificationService.sendQuoteRequestSent(
               companyId, 
               userName, 
               requirementId
            );

            res.status(200).json({ 
               success: true, 
               message: 'Bid request created successfully',
                data: {
                  bidRequest: newBidRequest,
                  notification
               }
            });
            } catch (error: any) {
               errorResponse(error, res, error.message || "Failed to send quote request notifications");
            }
      }
   ]

   getBidRequestForCompany = [
      authMiddleware,
      requireCompany,
      async(req:Request<{}, {}, BidRequestData>, res: Response, next: NextFunction): Promise<void> => {
         try {
            const { companyId } = req.query;

            if (!companyId) {
               res.status(400).json({ 
                  success: false, 
                  error: 'CompanyId is required as query parameter' 
               });
            }

            const bidRequests = await bidRepository.getBidRequestForCompany(Number(companyId));

            res.status(200).json({ 
               success: true, 
               message: `Bid fetch for company ${companyId}`,
               data: {
                  bidRequests,
                  count: bidRequests.length
               }
            });
         } catch (error: any) {
            errorResponse(error, res, error.message || "Failed to fetch bids for company");
         }
      }
   ]

   getBidRequestForRequirement = [
      authMiddleware,
      requireClient,
      async(req:Request<{}, {}, BidRequestData>, res: Response, next: NextFunction): Promise<void> => {
         try {
            const { requirementId } = req.query;

            if (!requirementId) {
               res.status(400).json({ 
                  success: false, 
                  error: 'RequirementId is required as query parameter' 
               });
            }

            const bids = await bidRepository.getBidRequestFprRequirement(Number(requirementId));

            res.status(200).json({ 
               success: true, 
               message: `Bid fetch for requirement ${requirementId}`,
               data: {
                  bids,
                  count: bids.length
               }
            });
         } catch (error: any) {
            errorResponse(error, res, error.message || "Failed to fetch bids for company");
         }
      }
   ]

   getRequirementsWithBidRequests = [
      authMiddleware,
      requireCompany,
      async (req: Request<{}, {}, {}, {companyId, requirementId, status, page, limit}>, res: Response, next: NextFunction): Promise<void> => {
      try {
        const { companyId, status, page = 1, limit = 10 } = req.query;

        if (!companyId) {
          res.status(400).json({ 
            success: false, 
            error: 'CompanyId is required' 
          });
          return;
        }

        // Get requirements that have requested bids from this company
        const result = await bidRepository.getRequirementsWithBidRequests({
          companyId,
          page: Number(page),
          limit: Number(limit)
        });

        res.status(200).json({ 
          success: true, 
          message: `Requirements with bid requests fetched for company ${companyId}`,
          data: result
        });
      } catch (error: any) {
        errorResponse(error, res, error.message || "Failed to fetch requirements with bid requests");
      }
    }
   ]

   submitQuoteRequest = [
      authMiddleware,
      requireClient,
      async(req:Request<{}, {}, BidData>, res: Response, next: NextFunction): Promise<void> => {
         try {
            const { amount, deliveryTime, message, companyId, requirementId, status } = req.body;

            const requirement = requirementRepository.getRequirementById(requirementId);
            const company = companyRepository.getCompanyById(companyId);

            const submittedQuote = {
               amount,
               deliveryTime,
               message,
               status,
               companyId,
               requirementId,
               createdAt: new Date()
            }

            if (!companyId || !requirementId) {
               res.status(400).json({ 
                  success: false, 
                  error: 'RequirementId and companyId are required' 
               });
            }

            const newQuote = await bidRepository.createQuote(submittedQuote);

            await notificationService.sendNewQuoteCreated(
               (await requirement).userId,
               newQuote.id, 
               (await requirement).title,
               (await company).name
            );

            res.status(200).json({ 
               success: true, 
               message: 'Bid request created successfully',
                data: {
                  quote: newQuote
               }
            });
            } catch (error: any) {
               errorResponse(error, res, error.message || "Failed to send quote request notifications");
            }
      }
   ]

   getQuoteForRequirement = [
      authMiddleware,
      requireClient,
      async(req:Request<{}, {}, BidRequestData>, res: Response, next: NextFunction): Promise<void> => {
         try {
            const { requirementId } = req.query;

            if (!requirementId) {
               res.status(400).json({ 
                  success: false, 
                  error: 'RequirementId is required as query parameter' 
               });
            }

            const quotes = await bidRepository.getQuoteForRequirement(Number(requirementId));            

            res.status(200).json({ 
               success: true, 
               message: `Bid fetch for requirement ${requirementId}`,
               data: {
                  quotes,
                  count: quotes.length
               }
            });
         } catch (error: any) {
            errorResponse(error, res, error.message || "Failed to fetch bids for company");
         }
      }
   ]

   acceptQuoteByClient = [
      authMiddleware,
      requireClient,
      async(req:Request<{quoteId: string}, {}, BidData>, res: Response, next: NextFunction): Promise<void> => {
         try {
            const { quoteId } = req.params;

            if (!quoteId) {
               res.status(400).json({ error: "quoteId is required" });
            }

            const updatedBid = await bidRepository.acceptQuoteByClient(Number(quoteId));


            res.status(200).json({
               message: "Quote accepted successfully",
               data: updatedBid,
            });

         } catch (error: any) {
            errorResponse(error, res, error.message || "Failed to fetch bids for company");
         }
      }
   ]

   declineQuoteByClient = [
      authMiddleware,
      requireClient,
      async(req:Request<{quoteId: string}, {}, BidData>, res: Response, next: NextFunction): Promise<void> => {
         try {
            const { quoteId } = req.params;

            if (!quoteId) {
               res.status(400).json({ error: "quoteId is required" });
            }

            const updatedBid = await bidRepository.declineQuoteByClient(Number(quoteId));

            res.status(200).json({
               message: "Quote declined successfully",
               data: updatedBid,
            });

         } catch (error: any) {
            errorResponse(error, res, error.message || "Failed to fetch bids for company");
         }
      }
   ]

   checkCompanyBidStatus = [
      authMiddleware,
      requireCompany,
      async (req: Request, res: Response, next: NextFunction): Promise<void> => {
         try {
            const request = req as Request & { userId: string };
            const companyId = Number(request.userId);
            const { requirementId } = req.params;

            if (!requirementId) {
               res.status(400).json({ error: "requirementId is required" });
            }

            // Check if bid exists
            const existingBid = await bidRepository.findBidByCompanyAndRequirement(
               Number(companyId),
               Number(requirementId)
            );

            res.status(200).json({
               hasSubmitted: !!existingBid,
               bid: existingBid ? {
                  id: existingBid.id,
                  status: existingBid.status,
                  amount: existingBid.amount,
                  submittedAt: existingBid.createdAt
               } : null
            });

         } catch (error: any) {
            errorResponse(error, res, error.message || "Failed to check bid status");
         }
      }
   ];

   getCompanySubmittedBids =[
      async (req: Request, res: Response, next: NextFunction): Promise<void> => {
         try {
            const request = req as Request & { userId: string };
            const companyId = Number(request.userId);

            // Check if bid exists
            const bids = await bidRepository.getBidsSubmittedByCompany(companyId);

            const formatted = bids.map((bid) => ({
               bidId: bid.id,
               bidStatus: bid.status,
               bidPrice: bid.amount,
               deliveryTime: bid.deliveryTime,
               message: bid.message,
               submittedAt: bid.createdAt,

               requirement: {
                  requirementId: bid.requirement.id,
                  title: bid.requirement.title,
                  description: bid.requirement.description,
                  budgetRange: `${bid.requirement.minimumBudget} - ${bid.requirement.maximumBudget}`,
                  postedAt: bid.requirement.createdAt,
               },
            }));

            res.status(201).json({
               totalBids: formatted.length,
               bids: formatted,
            });

         } catch (error: any) {
            errorResponse(error, res, error.message || "Failed to fetch bids");
         }
      }
   ]

}

export default new BidController();