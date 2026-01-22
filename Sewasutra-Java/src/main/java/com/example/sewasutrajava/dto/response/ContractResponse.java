package com.example.demo.dto.response;

import com.example.demo.enums.ContractStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContractResponse {
    private Long id;
    private String projectId;
    private Long requirementId;
    private String requirementTitle;
    private Long quoteId;
    private Long companyId;
    private String companyName;
    private Long clientId;
    private String clientName;
    private String serviceType;
    private Double totalAmount;
    private Integer advancePercent;
    private Double advanceAmount;
    private Integer durationDays;
    private String scopeSummary;
    private String termsAndConditions;
    private ContractStatus status;
    private String paymentStatus;
    private Boolean clientSigned;
    private Boolean companySigned;
    private LocalDateTime clientSignedAt;
    private LocalDateTime companySignedAt;
    private String contractFile;
    private LocalDateTime startDate;
    private LocalDateTime endDate;
    private LocalDateTime createdAt;
    private Double totalPaid;
    private Double remainingAmount;
}
