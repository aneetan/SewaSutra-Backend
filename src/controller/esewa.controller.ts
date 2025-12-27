import { NextFunction, Request, Response } from "express";
import { esewaRepository } from "../repository/esewa.repository";
import { esewaConfig } from "../config/esewa.config";
import prisma from "../config/dbconfig";
import { generateHmacSha256Hash, safeStringify } from "../utils/esewa/generateHash";
import { EsewaSignedPayload } from "../types/esewa.type";
import axios from "axios";
import { parseStringPromise } from "xml2js";
import contractRepository from "../repository/contract.repository";
import notificationService from "../services/notification.service";

class EsewaController {
   initiate = [
      async (req: Request, res: Response, next: NextFunction) => {
         const { amount, contractId } = req.body;
         const commissionRate = 0.1;
         const adminCommission = amount * commissionRate;
         const vendorAmount = amount - adminCommission;

         if (!amount || !contractId) {
            res.status(400).json({
               message: "amount and contractId are required",
            });
         }

         const request = req as Request & { userId: string };
         const clientId = Number(request.userId);

         const contract = await prisma.contract.findUnique({
            where: { id: contractId },
         });
         if (!contract) throw new Error("Contract not found");

         const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;
         
         let paymentData = {
            amount,
            failure_url: esewaConfig.failureUrl,
            product_delivery_charge: "0",
            product_service_charge: "0",
            product_code: esewaConfig.merchantCode,
            signed_field_names: "total_amount,transaction_uuid,product_code",
            success_url: esewaConfig.successUrl,
            tax_amount: "0",
            total_amount: amount,
            transaction_uuid: transactionId,
            signature: ""
         };

         const data = `total_amount=${paymentData.total_amount},transaction_uuid=${paymentData.transaction_uuid},product_code=${paymentData.product_code}`;

         const signature = generateHmacSha256Hash(data, esewaConfig.secretKey); 

         paymentData = { ...paymentData, signature };

         const payload: EsewaSignedPayload = {
            ...paymentData,
            signature,
         };

         try {
            const payment = await axios.post(esewaConfig.paymentUrl, null, {
               params: paymentData,
            });
            const reqPayment = JSON.parse(safeStringify(payment));
            if (reqPayment.status === 200) {
               await esewaRepository.createPayment({
                  contractId,
                  clientId,
                  companyId: contract.companyId,
                  amount,
                  transactionId: transactionId,
                  gatewayPayload: payload,
                  commission: adminCommission,
                  companyAmount: vendorAmount
               })
               res.send({
                  data: {
                     ...paymentData,
                     url: reqPayment.request.res.responseUrl,
                  }
               });
            }
         } catch (error) {
            res.send(error);
            console.log(error)
         }
      }
   ]

   verifyPayment = [
   async (req: Request, res: Response, next: NextFunction) => {
      const { paymentId } = req.body;

      try {
         const payment = await esewaRepository.findByPaymentId(paymentId);
         if (!payment) {
            res.status(400).json({ message: "Transaction not found" });
         }

         // Build query params
         const params = {
            total_amount: payment.amount.toString(),
            transaction_uuid: payment.transactionId,
            product_code: "EPAYTEST",
         };

         // GET request for sandbox
         const response = await axios.get(esewaConfig.statusCheckUrl, { params });
         const responseData = response.data as { status: string; ref_id: string };

         if (responseData.status === "COMPLETE") {
            await esewaRepository.verifyPayment(payment.transactionId, responseData.ref_id, "");
            await contractRepository.updatePaymentForContract(payment.contractId);
            res.status(200).json({
               status: responseData.status,
               ref_id: responseData.ref_id,
               transactionId: payment.transactionId,
               amount: payment.amount,
               companyAmount: payment.companyAmount,
               commission: payment.commission 
            });
            await notificationService.sendPaymentReceived(payment.clientId, payment.id, payment.companyAmount)
         } else {
            res.status(400).json({ message: "Payment verification failed" });
         }
      } catch (e) {
         console.error("Payment verification error:", e);
         res.status(500).json({ message: "Error verifying transaction" });
      }
   },
   ];
}

export default new EsewaController();