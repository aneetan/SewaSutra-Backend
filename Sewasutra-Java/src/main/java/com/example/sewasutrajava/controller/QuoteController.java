package com.example.demo.controller;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.request.QuoteRequest;
import com.example.demo.dto.response.ContractResponse;
import com.example.demo.dto.response.QuoteResponse;
import com.example.demo.security.UserPrincipal;
import com.example.demo.service.QuoteService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/quotes")
public class QuoteController {

    @Autowired
    private QuoteService quoteService;

    /**
     * Submit a quote (PROVIDER only)
     */
    @PostMapping
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ApiResponse<QuoteResponse>> submitQuote(
            @Valid @RequestBody QuoteRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        // Get company ID from user's company (simplified - would need CompanyService)
        QuoteResponse response = quoteService.submitQuote(request, currentUser.getCompanyId());
        return ResponseEntity.ok(ApiResponse.success(response, "Quote submitted successfully"));
    }

    /**
     * Get quote by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<QuoteResponse>> getQuoteById(@PathVariable Long id) {
        QuoteResponse response = quoteService.getQuoteById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Quote fetched"));
    }

    /**
     * Get quotes for a requirement
     */
    @GetMapping("/by-requirement/{requirementId}")
    public ResponseEntity<ApiResponse<List<QuoteResponse>>> getQuotesByRequirement(
            @PathVariable Long requirementId) {
        List<QuoteResponse> response = quoteService.getQuotesByRequirement(requirementId);
        return ResponseEntity.ok(ApiResponse.success(response, "Quotes fetched"));
    }

    /**
     * Get my quotes (PROVIDER - quotes I submitted)
     */
    @GetMapping("/my-quotes")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ApiResponse<List<QuoteResponse>>> getMyQuotes(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<QuoteResponse> response = quoteService.getQuotesByCompany(currentUser.getCompanyId());
        return ResponseEntity.ok(ApiResponse.success(response, "Your quotes fetched"));
    }

    /**
     * Get received quotes (CLIENT - quotes I received on my requirements)
     */
    @GetMapping("/received")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ApiResponse<List<QuoteResponse>>> getReceivedQuotes(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<QuoteResponse> response = quoteService.getReceivedQuotes(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(response, "Received quotes fetched"));
    }

    /**
     * Get pending quote requests (PROVIDER)
     */
    @GetMapping("/pending")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ApiResponse<List<QuoteResponse>>> getPendingQuotes(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<QuoteResponse> response = quoteService.getPendingQuotesForCompany(currentUser.getCompanyId());
        return ResponseEntity.ok(ApiResponse.success(response, "Pending quotes fetched"));
    }

    /**
     * Update quote (PROVIDER)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ApiResponse<QuoteResponse>> updateQuote(
            @PathVariable Long id,
            @Valid @RequestBody QuoteRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        QuoteResponse response = quoteService.updateQuote(id, request, currentUser.getCompanyId());
        return ResponseEntity.ok(ApiResponse.success(response, "Quote updated successfully"));
    }

    /**
     * Accept quote - AUTO-CREATES CONTRACT (CLIENT)
     */
    @PutMapping("/{id}/accept")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ApiResponse<ContractResponse>> acceptQuote(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        ContractResponse contract = quoteService.acceptQuote(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(contract,
                "Quote accepted! Contract created automatically."));
    }

    /**
     * Reject quote (CLIENT)
     */
    @PutMapping("/{id}/reject")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ApiResponse<QuoteResponse>> rejectQuote(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        QuoteResponse response = quoteService.rejectQuote(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(response, "Quote rejected"));
    }

    /**
     * Withdraw quote (PROVIDER)
     */
    @PutMapping("/{id}/withdraw")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ApiResponse<QuoteResponse>> withdrawQuote(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        QuoteResponse response = quoteService.withdrawQuote(id, currentUser.getCompanyId());
        return ResponseEntity.ok(ApiResponse.success(response, "Quote withdrawn"));
    }

    /**
     * Delete quote (PROVIDER)
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ApiResponse<Void>> deleteQuote(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        quoteService.deleteQuote(id, currentUser.getCompanyId());
        return ResponseEntity.ok(ApiResponse.success(null, "Quote deleted"));
    }
}
