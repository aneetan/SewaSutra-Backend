package com.example.demo.model;



import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

import com.example.demo.enums.PaymentMethodType;



@Entity
@Table(name = "company_payment_methods")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompanyPaymentMethod {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Enumerated(EnumType.STRING)
    private PaymentMethodType type; // ENUM: BANK, UPI, CARD, WALLET

    private String accountName;

    private String phoneNumber;

    private String publicKey;

    private String secretKey;

    private String businessName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;
}
