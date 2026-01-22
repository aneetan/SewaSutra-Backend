package com.example.demo.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class QuoteRequest {

    @NotNull(message = "Requirement ID is required")
    private Long requirementId;

    @NotNull(message = "Amount is required")
    @Min(value = 1000, message = "Amount must be at least NPR 1000")
    private Double amount;

    @NotBlank(message = "Delivery time is required")
    private String deliveryTime;

    @NotBlank(message = "Message is required")
    @Size(min = 50, max = 5000, message = "Message must be between 50 and 5000 characters")
    private String message;

    private String breakdown; // JSON cost breakdown
}
