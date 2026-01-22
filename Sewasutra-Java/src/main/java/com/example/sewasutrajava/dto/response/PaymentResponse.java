package com.example.demo.dto.response;

import com.example.demo.enums.PaymentGateway;
import com.example.demo.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponse {
    private Long id;
    private Long contractId;
    private Long clientId;
    private String clientName;
    private Long companyId;
    private String companyName;
    private PaymentGateway gateway;
    private Double amount;
    private PaymentStatus status;
    private String transactionId;
    private String gatewayRefId;
    private Double commission;
    private Double companyAmount;
    private String paymentType;
    private String receiptUrl;
    private LocalDateTime createdAt;
}
