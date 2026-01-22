package com.example.demo.controller;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.request.PaymentInitiateRequest;
import com.example.demo.dto.response.PaymentInitiateResponse;
import com.example.demo.dto.response.PaymentResponse;
import com.example.demo.security.UserPrincipal;
import com.example.demo.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentService paymentService;

    /**
     * Initiate payment - returns redirect URL for gateway
     */
    @PostMapping("/initiate")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ApiResponse<PaymentInitiateResponse>> initiatePayment(
            @Valid @RequestBody PaymentInitiateRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        PaymentInitiateResponse response = paymentService.initiatePayment(request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(response, "Payment initiated. Redirect to payment gateway."));
    }

    /**
     * eSewa payment callback (public endpoint)
     */
    @GetMapping("/esewa/callback")
    public ResponseEntity<ApiResponse<PaymentResponse>> esewaCallback(
            @RequestParam Map<String, String> params) {

        PaymentResponse response = paymentService.verifyEsewaPayment(params);
        return ResponseEntity.ok(ApiResponse.success(response, "Payment verified"));
    }

    /**
     * Stripe webhook (public endpoint)
     */
    @PostMapping("/stripe/webhook")
    public ResponseEntity<ApiResponse<PaymentResponse>> stripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {

        PaymentResponse response = paymentService.handleStripeWebhook(payload, sigHeader);
        return ResponseEntity.ok(ApiResponse.success(response, "Webhook processed"));
    }

    /**
     * Get payment by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<PaymentResponse>> getPaymentById(@PathVariable Long id) {
        PaymentResponse response = paymentService.getPaymentById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Payment fetched"));
    }

    /**
     * Get payment history
     */
    @GetMapping("/history")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getPaymentHistory(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<PaymentResponse> response = paymentService.getPaymentHistory(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(response, "Payment history fetched"));
    }



    /**
     * Refund payment (ADMIN only)
     */
    @PostMapping("/{id}/refund")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<PaymentResponse>> refundPayment(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        PaymentResponse response = paymentService.refundPayment(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(response, "Payment refunded"));
    }
}
