package com.example.demo.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

import com.example.demo.enums.PaymentGateway;
import com.example.demo.enums.PaymentStatus;

@Entity
@Table(name = "app_payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AppPayment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private PaymentGateway gateway; // ENUM: STRIPE, PAYPAL, RAZORPAY, BANK_TRANSFER

    private Double amount;

    private String paymentType;

    @Enumerated(EnumType.STRING)
    private PaymentStatus status; // ENUM: PENDING, COMPLETED, FAILED, REFUNDED

    private String gatewayRefId;

    private String transactionId;

    @Column(columnDefinition = "json")
    private String gatewayPayload;

    private Double commission;

    private Double companyAmount;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contract_id", nullable = false)
    private Contract contract;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private User client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
