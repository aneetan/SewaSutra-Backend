package com.example.demo.dto.response;

import com.example.demo.enums.QuoteStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuoteResponse {
    private Long id;
    private Long requirementId;
    private String requirementTitle;
    private Long companyId;
    private String companyName;
    private Double companyRating;
    private Double amount;
    private String deliveryTime;
    private String message;
    private String breakdown;
    private QuoteStatus status;
    private LocalDateTime validUntil;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
