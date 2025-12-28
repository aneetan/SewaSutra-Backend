import { NextFunction, Request, Response } from "express";
import prisma from "../config/dbconfig";
import contractRepository from "../repository/contract.repository";
import notificationService from "../services/notification.service";
import Stripe from "stripe";
import { esewaRepository } from "../repository/esewa.repository";
import { PaymentType } from "@prisma/client";
import { ConfigureIndexRequestSpecFromJSON } from "@pinecone-database/pinecone/dist/pinecone-generated-ts-fetch/db_control";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-12-15.clover",
});

class StripeController {
  createPaymentIntent = [
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        const { amount, contractId } = req.body;

        if (!amount || !contractId) {
          return res.status(400).json({
            message: "amount and contractId are required",
          });
        }

        const request = req as Request & { userId: string };
        const clientId = Number(request.userId);

        const contract = await prisma.contract.findUnique({
          where: { id: contractId },
        });

        if (!contract) {
          return res.status(404).json({ message: "Contract not found" });
        }

        // 💰 Commission logic (same as eSewa)
        const commissionRate = 0.1;
        const adminCommission = amount * commissionRate;
        const companyAmount = amount - adminCommission;
        
        const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

        // 🆔 Create Stripe PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(amount * 100), // Stripe uses smallest unit
          currency: "usd",
          metadata: {
            contractId: contractId.toString(),
            clientId: clientId.toString(),
          },
          automatic_payment_methods: {
            enabled: true,
          },
        });

        // 🗄️ Save payment to DB 
        const payment = await esewaRepository.createPayment({
          contractId,
          clientId,
          companyId: contract.companyId,
          amount,
          transactionId: transactionId,
          gatewayPayload: paymentIntent,
          commission: adminCommission,
          gateway: PaymentType.STRIPE,
          gatewayrefId: paymentIntent.id,
          companyAmount
        });
        
        await contractRepository.updatePaymentForContract(payment.contractId);

        res.status(200).json({
          clientSecret: paymentIntent.client_secret,
          paymentDetails: {
            paymentId: payment.id,
            ref_id: paymentIntent.id,
            transactionId: payment.transactionId,
            amount: payment.amount,
            companyAmount: payment.companyAmount,
            commission: payment.commission 
          }
        });

        await notificationService.sendPaymentReceived(
            payment.clientId,
            payment.id,
            payment.companyAmount
          );
      } catch (e: any) {
        console.error("Stripe create payment error:", e);
        res.status(500).json({ message: e.message });
      }
    },
  ];

  /**
   * Optional manual verification (fallback)
   * Recommended: use Webhooks instead
   */
  verifyPayment = [
    async (req: Request, res: Response) => {
      const { paymentId } = req.body;

      try {
        const payment = await esewaRepository.findByPaymentId(paymentId);
        if (!payment) {
         res.status(404).json({ message: "Payment not found" });
        }

        const intent = await stripe.paymentIntents.retrieve(
          payment.transactionId
        );

        if (intent.status === "succeeded") {
          await esewaRepository.verifyPayment(
            payment.transactionId,
            intent.latest_charge as string,
          );

          await contractRepository.updatePaymentForContract(payment.contractId);

          res.status(200).json({
            status: intent.status,
            transactionId: intent.id,
            amount: payment.amount,
            companyAmount: payment.companyAmount,
            commission: payment.commission,
          });

          
          await notificationService.sendPaymentReceived(
            payment.clientId,
            payment.id,
            payment.companyAmount
          );
        }

        res.status(400).json({ message: "Payment not completed" });
      } catch (e) {
        console.error("Stripe verify error:", e);
        res.status(500).json({ message: "Verification failed" });
      }
    },
  ];
}

export default new StripeController();
