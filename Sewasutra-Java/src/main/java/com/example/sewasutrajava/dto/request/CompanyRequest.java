package com.example.demo.dto.request;

import com.example.demo.enums.CompanyStatus;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CompanyRequest {

    @NotBlank(message = "Registration number is required")
    private String registrationNo;

    @NotBlank(message = "Description is required")
    @Size(min = 20, max = 5000, message = "Description must be between 20 and 5000 characters")
    private String description;

    @NotBlank(message = "Established year is required")
    private String establishedYear;

    @NotBlank(message = "Service category is required")
    private String serviceCategory;

    private String websiteUrl;

    @Min(value = 0, message = "Minimum price must be non-negative")
    private Integer priceRangeMin;

    @Min(value = 0, message = "Maximum price must be non-negative")
    private Integer priceRangeMax;

    private String avgDeliveryTime;

    @NotNull(message = "User ID is required")
    private Long userId;
}
