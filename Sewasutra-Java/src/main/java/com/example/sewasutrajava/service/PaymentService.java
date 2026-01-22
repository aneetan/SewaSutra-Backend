package com.example.demo.service;

import com.example.demo.dto.request.PaymentInitiateRequest;
import com.example.demo.dto.response.PaymentInitiateResponse;
import com.example.demo.dto.response.PaymentResponse;

import java.util.List;
import java.util.Map;

public interface PaymentService {

    // Initiate payment - returns redirect URL
    PaymentInitiateResponse initiatePayment(PaymentInitiateRequest request, Long userId);

    // Verify eSewa payment callback
    PaymentResponse verifyEsewaPayment(Map<String, String> callbackParams);

    // Handle Stripe webhook
    PaymentResponse handleStripeWebhook(String payload, String sigHeader);

    PaymentResponse getPaymentById(Long id);

    List<PaymentResponse> getPaymentsByContract(Long contractId);

    List<PaymentResponse> getPaymentHistory(Long userId);



    // Admin: Refund payment
    PaymentResponse refundPayment(Long paymentId, Long adminId);

    // Get total paid for contract
    Double getTotalPaidForContract(Long contractId);
}
