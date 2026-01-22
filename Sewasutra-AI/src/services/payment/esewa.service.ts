// import crypto from "crypto";
// import axios from "axios";
// import { esewaConfig } from "../../config/esewa.config";
// import { EsewaSignedPayload, InitiateEsewaPaymentInput } from "../../types/esewa.type";
// import prisma from "../../config/dbconfig";
// import { esewaRepository } from "../../repository/esewa.repository";
// import { generateHmacSha256Hash } from "../../utils/esewa/generateHash";

// class EsewaService {
//   private sign(message: string): string {
//     return crypto
//       .createHmac("sha256", esewaConfig.secretKey)
//       .update(message)
//       .digest("base64");
//   }

//   async initiatePayment(input: InitiateEsewaPaymentInput) {
//     const contract = await prisma.contract.findUnique({
//       where: { id: input.contractId },
//     });

//     const amount = input.amount;
//     if (!contract) throw new Error("Contract not found");

//     const transactionId = `TXN-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

//     let paymentData = {
//       amount,
//       failure_url: esewaConfig.failureUrl,
//       product_delivery_charge: "0",
//       product_service_charge: "0",
//       product_code: esewaConfig.merchantCode,
//       signed_field_names: "total_amount,transaction_uuid,product_code",
//       success_url: esewaConfig.successUrl,
//       tax_amount: "0",
//       total_amount: amount,
//       transaction_uuid: transactionId,
//     };

//     const data = `total_amount=${paymentData.total_amount},transaction_uuid=${paymentData.transaction_uuid},product_code=${paymentData.product_code}`;

//     const signature = generateHmacSha256Hash(data, esewaConfig.secretKey); 

//     paymentData = { ...paymentData, signature };

//     await esewaRepository.createPayment({
//       contractId: contract.id,
//       clientId: input.clientId,
//       companyId: contract.companyId,
//       amount: input.amount,
//       transactionId,
//       gatewayPayload: payload,
//     });

//     return {
//       paymentUrl: esewaConfig.paymentUrl,
//       payload,
//     };
//   }

//   async verifyPayment(transactionId: string, refId: string) {
//     const payment = await esewaRepository.findByTransactionId(transactionId);
//     if (!payment) throw new Error("Payment not found");

//     if (payment.status === "SUCCESS") return true;

//     const response = await axios.get(esewaConfig.verifyUrl, {
//       params: {
//         product_code: esewaConfig.merchantCode,
//         transaction_uuid: transactionId,
//         total_amount: payment.amount,
//       },
//     });

//     await prisma.$transaction([
//       esewaRepository.markSuccess(transactionId, refId, response.data),
//       prisma.contract.update({
//         where: { id: payment.contractId },
//         data: {
//           paymentStatus: "FULLY_PAID",
//           status: "ACTIVE",
//         },
//       }),
//     ]);

//     return true;
//   }
// }

// export const esewaService = new EsewaService();
