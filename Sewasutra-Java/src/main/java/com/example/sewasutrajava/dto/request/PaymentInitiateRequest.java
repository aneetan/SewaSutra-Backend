package com.example.demo.dto.request;

import com.example.demo.enums.PaymentGateway;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentInitiateRequest {

    @NotNull(message = "Contract ID is required")
    private Long contractId;

    @NotNull(message = "Gateway is required")
    private PaymentGateway gateway; // ESEWA, STRIPE

    @NotNull(message = "Amount is required")
    @Min(value = 1000, message = "Minimum amount is NPR 1000")
    @Max(value = 500000, message = "Maximum amount is NPR 500,000")
    private Double amount;

    @NotBlank(message = "Payment type is required")
    private String paymentType; // ADVANCE, MILESTONE, FINAL
}
