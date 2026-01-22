package com.example.demo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response containing payment gateway redirect URL
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentInitiateResponse {
    private Long paymentId;
    private String redirectUrl;
    private String gateway;
    private Double amount;
    private String transactionUuid;
}
