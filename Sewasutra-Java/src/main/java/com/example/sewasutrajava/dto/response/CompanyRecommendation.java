package com.example.demo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * AI-powered company recommendation with similarity score
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompanyRecommendation {
    private Long companyId;
    private String companyName;
    private String description;
    private String serviceCategory;
    private Double averageRating;
    private Integer totalProjects;
    private Integer priceRangeMin;
    private Integer priceRangeMax;
    private String avgDeliveryTime;

    // Scoring breakdown
    private Double overallScore;
    private Double skillsMatchScore;
    private Double budgetCompatibilityScore;
    private Double ratingScore;
    private Double deliveryTimeScore;
    private Double performanceScore;
}
