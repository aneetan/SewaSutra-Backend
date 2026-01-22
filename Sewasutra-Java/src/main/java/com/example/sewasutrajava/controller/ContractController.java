package com.example.demo.controller;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.response.ContractResponse;
import com.example.demo.dto.response.PaymentResponse;
import com.example.demo.security.UserPrincipal;
import com.example.demo.service.ContractService;
import com.example.demo.service.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/contracts")
public class ContractController {

    @Autowired
    private ContractService contractService;

    @Autowired
    private PaymentService paymentService;

    /**
     * Get contract by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ContractResponse>> getContractById(@PathVariable Long id) {
        ContractResponse response = contractService.getContractById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Contract fetched"));
    }

    /**
     * Get my contracts (all contracts I'm part of)
     */
    @GetMapping("/my-contracts")
    public ResponseEntity<ApiResponse<List<ContractResponse>>> getMyContracts(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<ContractResponse> response = contractService.getContractsByUser(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(response, "Your contracts fetched"));
    }

    /**
     * Get contracts by company (PROVIDER)
     */
    @GetMapping("/by-company/{companyId}")
    @PreAuthorize("hasRole('PROVIDER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<ContractResponse>>> getContractsByCompany(
            @PathVariable Long companyId) {
        List<ContractResponse> response = contractService.getContractsByCompany(companyId);
        return ResponseEntity.ok(ApiResponse.success(response, "Company contracts fetched"));
    }

    /**
     * Sign contract
     */
    @PutMapping("/{id}/sign")
    public ResponseEntity<ApiResponse<ContractResponse>> signContract(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        ContractResponse response = contractService.signContract(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(response, "Contract signed successfully"));
    }

    /**
     * Mark contract as complete (PROVIDER only)
     */
    @PutMapping("/{id}/complete")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ApiResponse<ContractResponse>> completeContract(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        ContractResponse response = contractService.completeContract(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(response, "Contract marked as complete"));
    }

    /**
     * Cancel contract (before activation)
     */
    @PutMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<ContractResponse>> cancelContract(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        ContractResponse response = contractService.cancelContract(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(response, "Contract cancelled"));
    }

    /**
     * Download contract PDF
     */
    @GetMapping("/{id}/download")
    public ResponseEntity<ApiResponse<String>> downloadContract(@PathVariable Long id) {
        String downloadUrl = contractService.getContractDownloadUrl(id);
        return ResponseEntity.ok(ApiResponse.success(downloadUrl, "Download URL"));
    }

    /**
     * Get payments for contract
     */
    @GetMapping("/{id}/payments")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getContractPayments(
            @PathVariable Long id) {
        List<PaymentResponse> response = paymentService.getPaymentsByContract(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Payments fetched"));
    }
}
