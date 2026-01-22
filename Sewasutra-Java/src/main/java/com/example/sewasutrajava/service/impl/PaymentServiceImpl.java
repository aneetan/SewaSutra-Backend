package com.example.demo.service.impl;

import com.example.demo.dto.request.PaymentInitiateRequest;
import com.example.demo.dto.response.PaymentInitiateResponse;
import com.example.demo.dto.response.PaymentResponse;
import com.example.demo.enums.ContractStatus;
import com.example.demo.enums.NotificationType;
import com.example.demo.enums.PaymentGateway;
import com.example.demo.enums.PaymentStatus;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.AppPayment;
import com.example.demo.model.Contract;
import com.example.demo.repository.AppPaymentRepository;
import com.example.demo.repository.ContractRepository;
import com.example.demo.service.NotificationService;
import com.example.demo.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class PaymentServiceImpl implements PaymentService {

    @Autowired
    private AppPaymentRepository paymentRepository;

    @Autowired
    private ContractRepository contractRepository;

    @Autowired(required = false)
    private NotificationService notificationService;

    @Value("${app.payment.commission-percent:5}")
    private double commissionPercent;

    @Value("${esewa.merchant.code:EPAYTEST}")
    private String esewaMerchantCode;

    @Value("${esewa.base.url:https://uat.esewa.com.np/epay/main}")
    private String esewaBaseUrl;

    @Value("${esewa.success.url:http://localhost:8080/api/payments/esewa/callback}")
    private String esewaSuccessUrl;

    @Override
    public PaymentInitiateResponse initiatePayment(PaymentInitiateRequest request, Long userId) {
        Contract contract = contractRepository.findById(request.getContractId())
                .orElseThrow(() -> new ResourceNotFoundException("Contract", "id", request.getContractId()));

        if (contract.getStatus() != ContractStatus.ACTIVE) {
            throw new BadRequestException("Payment can only be made for ACTIVE contracts");
        }

        // Validate user is the client
        if (!contract.getClient().getId().equals(userId)) {
            throw new BadRequestException("Only the client can make payments");
        }

        // Create payment record
        AppPayment payment = new AppPayment();
        payment.setContract(contract);
        payment.setClient(contract.getClient());
        payment.setCompany(contract.getCompany());
        payment.setGateway(request.getGateway());
        payment.setAmount(request.getAmount());
        payment.setGatewayPayload(request.getPaymentType());
        payment.setStatus(PaymentStatus.PENDING);

        // Calculate commission
        double commission = request.getAmount() * (commissionPercent / 100);
        payment.setCommission(commission);
        payment.setCompanyAmount(request.getAmount() - commission);
        payment.setPaymentType(request.getPaymentType());

        // Generate transaction UUID
        String transactionUuid = "TXN-" + UUID.randomUUID().toString().substring(0, 12).toUpperCase();
        payment.setTransactionId(transactionUuid);

        AppPayment saved = paymentRepository.save(payment);

        // Generate redirect URL based on gateway
        String redirectUrl;
        if (request.getGateway() == PaymentGateway.ESEWA) {
            redirectUrl = generateEsewaUrl(saved);
        } else if (request.getGateway() == PaymentGateway.STRIPE) {
            redirectUrl = generateStripeUrl(saved);
        } else {
            throw new BadRequestException("Unsupported payment gateway");
        }

        PaymentInitiateResponse response = new PaymentInitiateResponse();
        response.setPaymentId(saved.getId());
        response.setRedirectUrl(redirectUrl);
        response.setGateway(request.getGateway().name());
        response.setAmount(request.getAmount());
        response.setTransactionUuid(transactionUuid);

        return response;
    }

    private String generateEsewaUrl(AppPayment payment) {
        // eSewa payment URL format
        return String.format("%s?amt=%.2f&pdc=0&psc=0&txAmt=0&tAmt=%.2f&pid=%s&scd=%s&su=%s&fu=%s",
                esewaBaseUrl,
                payment.getAmount(),
                payment.getAmount(),
                payment.getTransactionId(),
                esewaMerchantCode,
                esewaSuccessUrl + "?paymentId=" + payment.getId(),
                esewaSuccessUrl + "?paymentId=" + payment.getId() + "&status=failed");
    }

    private String generateStripeUrl(AppPayment payment) {
        // AI: Using mock Stripe session creation for demo purposes
        return "https://checkout.stripe.com/c/pay/cs_test_" + UUID.randomUUID().toString() + "?paymentId="
                + payment.getId();
    }

    @Override
    public PaymentResponse verifyEsewaPayment(Map<String, String> callbackParams) {
        String paymentId = callbackParams.get("paymentId");
        String refId = callbackParams.get("refId");
        String status = callbackParams.getOrDefault("status", "success");

        AppPayment payment = paymentRepository.findById(Long.parseLong(paymentId))
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", paymentId));

        if ("failed".equals(status)) {
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            return mapToResponse(payment);
        }

        // Verify with eSewa API (simplified - would make API call in production)
        payment.setStatus(PaymentStatus.COMPLETED);
        payment.setGatewayRefId(refId);
        payment.setGatewayPayload(callbackParams.toString());

        AppPayment saved = paymentRepository.save(payment);

        // Update contract payment status
        updateContractPaymentStatus(payment.getContract().getId());

        // Send notifications
        sendPaymentNotifications(saved);

        return mapToResponse(saved);
    }

    @Override
    public PaymentResponse handleStripeWebhook(String payload, String sigHeader) {
        // TODO: Implement Stripe webhook handling
        // Would verify signature and process event
        throw new UnsupportedOperationException("Stripe webhook handling not yet implemented");
    }

    private void updateContractPaymentStatus(Long contractId) {
        Contract contract = contractRepository.findById(contractId).orElse(null);
        if (contract != null) {
            Double totalPaid = paymentRepository.getTotalPaidByContractId(contractId);
            if (totalPaid != null) {
                if (totalPaid >= contract.getAmount()) {
                    contract.setPaymentStatus(PaymentStatus.valueOf("PAID"));
                } else if (totalPaid > 0) {
                    contract.setPaymentStatus(PaymentStatus.valueOf("PARTIAL"));
                }
                contractRepository.save(contract);
            }
        }
    }

    private void sendPaymentNotifications(AppPayment payment) {
        if (notificationService != null) {
            // Notify client
            notificationService.sendWithEmail(
                    payment.getClient().getId(),
                    "Payment Successful",
                    String.format("Your payment of NPR %,.2f was successful. Transaction ID: %s",
                            payment.getAmount(), payment.getTransactionId()),
                    NotificationType.SUCCESS,
                    "/payments/" + payment.getId());

            // Notify company
            notificationService.sendWithEmail(
                    payment.getCompany().getUser().getId(),
                    "Payment Received",
                    String.format("You received a payment of NPR %,.2f (after 5%% commission: NPR %,.2f)",
                            payment.getAmount(), payment.getCompanyAmount()),
                    NotificationType.SUCCESS,
                    "/payments/" + payment.getId());
        }
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentResponse getPaymentById(Long id) {
        AppPayment payment = paymentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", id));
        return mapToResponse(payment);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentsByContract(Long contractId) {
        return paymentRepository.findByContractId(contractId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<PaymentResponse> getPaymentHistory(Long userId) {
        return paymentRepository.findPaymentHistoryByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }



    @Override
    public PaymentResponse refundPayment(Long paymentId, Long adminId) {
        AppPayment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new ResourceNotFoundException("Payment", "id", paymentId));

        if (payment.getStatus() != PaymentStatus.COMPLETED) {
            throw new BadRequestException("Can only refund COMPLETED payments");
        }

        payment.setStatus(PaymentStatus.REFUNDED);
        AppPayment saved = paymentRepository.save(payment);

        // Update contract payment status
        updateContractPaymentStatus(payment.getContract().getId());

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public Double getTotalPaidForContract(Long contractId) {
        Double total = paymentRepository.getTotalPaidByContractId(contractId);
        return total != null ? total : 0.0;
    }

    private PaymentResponse mapToResponse(AppPayment payment) {
        PaymentResponse response = new PaymentResponse();
        response.setId(payment.getId());
        response.setContractId(payment.getContract().getId());
        response.setClientId(payment.getClient().getId());
        response.setClientName(payment.getClient().getName());
        response.setCompanyId(payment.getCompany().getId());
        response.setCompanyName(payment.getCompany().getUser().getName());
        response.setGateway(payment.getGateway());
        response.setAmount(payment.getAmount());
        response.setStatus(payment.getStatus());
        response.setTransactionId(payment.getTransactionId());
        response.setGatewayRefId(payment.getGatewayRefId());
        response.setCommission(payment.getCommission());
        response.setCompanyAmount(payment.getCompanyAmount());
        response.setPaymentType(payment.getPaymentType());
        response.setCreatedAt(payment.getCreatedAt());
        return response;
    }
}
