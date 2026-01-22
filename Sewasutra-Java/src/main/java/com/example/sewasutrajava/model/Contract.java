package com.example.demo.model;

import com.example.demo.enums.ContractStatus;
import com.example.demo.enums.PaymentStatus;
import com.example.demo.enums.ServiceType;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "contracts")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Contract {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String projectId;

    @Enumerated(EnumType.STRING)
    private ServiceType serviceType; // ENUM: FIXED, HOURLY, MILESTONE

    private Double amount;

    private Integer advancePercent;

    private String durationDays;

    @Column(columnDefinition = "TEXT")
    private String defectLiabilityMonths;

    private String location;

    @Column(columnDefinition = "TEXT")
    private String scopeSummary;

    @OneToOne(fetch = FetchType.LAZY)
    private Quote quote;

    @Enumerated(EnumType.STRING)
    private ContractStatus status; // ENUM: DRAFT, PENDING, ACTIVE, COMPLETED, CANCELLED

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus; // ENUM: UNPAID, PARTIAL, PAID

    private String contractFile;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "client_id", nullable = false)
    private User client;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "requirement_id")
    private Requirement requirement;

    @OneToMany(mappedBy = "contract", cascade = CascadeType.ALL)
    private List<AppPayment> payments;

    private String termsAndConditions;
    private LocalDateTime createdAt;
}
