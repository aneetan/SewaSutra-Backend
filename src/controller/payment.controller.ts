import { NextFunction, Request, Response } from "express";
import paymentRepository from "../repository/payment.repository";
import { errorResponse } from "../helpers/errorMsg.helper";
import { verifyAccessToken } from "../middleware/verifyAccessToken";
import { requireCompany } from "../middleware/validateRole";
import { authMiddleware } from "../middleware/authMiddleware";
import { 
  CreatePaymentMethodDto, 
  UpdatePaymentMethodDto
} from "../types/company/payment.type";

// Extend Express Request type to include userId
declare global {
  namespace Express {
    interface Request {
      userId?: number;
    }
  }
}

class PaymentController {
  // Get all payment methods for company
  getPaymentMethods = [
    authMiddleware,
    verifyAccessToken,
    requireCompany,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.userId) {
          res.status(401).json({
            success: false,
            message: "User ID not found in request",
          });
          return;
        }

        const userId = req.userId;
        const paymentMethods = await paymentRepository.getAllPayments(userId);

        res.status(200).json({
          success: true,
          message: "Payment methods retrieved successfully",
          body: paymentMethods,
        });
      } catch (e) {
        errorResponse(e, res, "Error fetching payment methods");
        next(e);
      }
    },
  ];

  // Create new payment method
  createPaymentMethod = [
    authMiddleware,
    verifyAccessToken,
    requireCompany,
    async (req: Request<{}, {}, CreatePaymentMethodDto>, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.userId) {
          res.status(401).json({
            success: false,
            message: "User ID not found in request",
          });
          return;
        }

        const userId = req.userId;
        const paymentData = req.body;

        // Check if payment type already exists
        const typeExists = await paymentRepository.paymentTypeExists(userId, paymentData.type);
        if (typeExists) {
          res.status(400).json({
            success: false,
            message: `${paymentData.type} payment method already exists for this company`,
          });
          return;
        }

        const newPayment = await paymentRepository.createPayment(userId, paymentData);

        res.status(201).json({
          success: true,
          message: "Payment method created successfully",
          body: newPayment,
        });
      } catch (e) {
        errorResponse(e, res, "Error creating payment method");
        next(e);
      }
    },
  ];

  // Update payment method
  updatePaymentMethod = [
    authMiddleware,
    verifyAccessToken,
    requireCompany,
    async (req: Request<{ id: string }, {}, UpdatePaymentMethodDto>, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.userId) {
          res.status(401).json({
            success: false,
            message: "User ID not found in request",
          });
          return;
        }

        const userId = req.userId;
        const { id } = req.params;
        const updates = req.body;

        // Get current payment method
        const currentPayment = await paymentRepository.getPaymentById(id, userId);
        if (!currentPayment) {
          res.status(404).json({
            success: false,
            message: "Payment method not found",
          });
          return;
        }

        const updatedPayment = await paymentRepository.updatePayment(id, userId, updates);

        res.status(200).json({
          success: true,
          message: "Payment method updated successfully",
          body: updatedPayment,
        });
      } catch (e) {
        errorResponse(e, res, "Error updating payment method");
        next(e);
      }
    },
  ];

  // Delete payment method
  deletePaymentMethod = [
    authMiddleware,
    verifyAccessToken,
    requireCompany,
    async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.userId) {
          res.status(401).json({
            success: false,
            message: "User ID not found in request",
          });
          return;
        }

        const userId = req.userId;
        const { id } = req.params;

        const deletedPayment = await paymentRepository.deletePayment(id, userId);

        res.status(200).json({
          success: true,
          message: "Payment method deleted successfully",
          body: deletedPayment,
        });
      } catch (e) {
        errorResponse(e, res, "Error deleting payment method");
        next(e);
      }
    },
  ];

  // Set default payment method
  setDefaultPaymentMethod = [
    authMiddleware,
    verifyAccessToken,
    requireCompany,
    async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.userId) {
          res.status(401).json({
            success: false,
            message: "User ID not found in request",
          });
          return;
        }

        const userId = req.userId;
        const { id } = req.params;

        const defaultPayment = await paymentRepository.setDefaultPayment(id, userId);

        res.status(200).json({
          success: true,
          message: "Payment method set as default successfully",
          body: defaultPayment,
        });
      } catch (e) {
        errorResponse(e, res, "Error setting default payment method");
        next(e);
      }
    },
  ];

  // Get payment method by ID
  getPaymentMethodById = [
    authMiddleware,
    verifyAccessToken,
    requireCompany,
    async (req: Request<{ id: string }>, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.userId) {
          res.status(401).json({
            success: false,
            message: "User ID not found in request",
          });
          return;
        }

        const userId = req.userId;
        const { id } = req.params;

        const payment = await paymentRepository.getPaymentById(id, userId);
        
        if (!payment) {
          res.status(404).json({
            success: false,
            message: "Payment method not found",
          });
          return;
        }

        res.status(200).json({
          success: true,
          message: "Payment method retrieved successfully",
          body: payment,
        });
      } catch (e) {
        errorResponse(e, res, "Error fetching payment method");
        next(e);
      }
    },
  ];

  // Get default payment method
  getDefaultPaymentMethod = [
    authMiddleware,
    verifyAccessToken,
    requireCompany,
    async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        if (!req.userId) {
          res.status(401).json({
            success: false,
            message: "User ID not found in request",
          });
          return;
        }

        const userId = req.userId;

        const defaultPayment = await paymentRepository.getDefaultPayment(userId);

        res.status(200).json({
          success: true,
          message: defaultPayment 
            ? "Default payment method retrieved successfully" 
            : "No default payment method set",
          body: defaultPayment,
        });
      } catch (e) {
        errorResponse(e, res, "Error fetching default payment method");
        next(e);
      }
    },
  ];
}

export default new PaymentController();