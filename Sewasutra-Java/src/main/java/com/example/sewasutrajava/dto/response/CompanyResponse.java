package com.example.demo.dto.response;

import com.example.demo.enums.CompanyStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompanyResponse {

    private Long id;
    private String registrationNo;
    private String description;
    private String establishedYear;
    private String serviceCategory;
    private String websiteUrl;
    private Integer priceRangeMin;
    private Integer priceRangeMax;
    private String avgDeliveryTime;
    private CompanyStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long userId;
    private String userName;
    private Double averageRating;
    private Integer totalReviews;
}
