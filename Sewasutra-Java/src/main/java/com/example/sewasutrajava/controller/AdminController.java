// java
package com.example.demo.controller;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.response.CompanyResponse;
import com.example.demo.dto.response.ContractResponse;
import com.example.demo.dto.response.PaymentResponse;
import com.example.demo.dto.response.UserResponse;
import com.example.demo.enums.CompanyStatus;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.Company;
import com.example.demo.model.User;
import com.example.demo.repository.*;
import com.example.demo.service.NotificationService;
import com.example.demo.service.EmailService;
import com.example.demo.enums.NotificationType;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ContractRepository contractRepository;

    @Autowired
    private AppPaymentRepository paymentRepository;

    @Autowired
    private RequirementRepository requirementRepository;

    @Autowired(required = false)
    private NotificationService notificationService;

    @Autowired(required = false)
    private EmailService emailService;

    /**
     * Admin Dashboard - statistics
     */
    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getDashboard() {
        Map<String, Object> stats = new HashMap<>();

        stats.put("totalUsers", userRepository.count());
        stats.put("totalCompanies", companyRepository.count());
        stats.put("pendingCompanies", companyRepository.findByStatus(CompanyStatus.PENDING).size());
        stats.put("verifiedCompanies", companyRepository.findByStatus(CompanyStatus.APPROVED).size());
        stats.put("totalContracts", contractRepository.count());
        stats.put("totalPayments", paymentRepository.count());
        stats.put("totalRequirements", requirementRepository.count());

        Double totalCommission = paymentRepository.getTotalCommission();
        stats.put("totalCommission", totalCommission != null ? totalCommission : 0.0);

        return ResponseEntity.ok(ApiResponse.success(stats, "Dashboard statistics"));
    }

    /**
     * Get pending companies for verification
     */
    @GetMapping("/companies/pending")
    public ResponseEntity<ApiResponse<List<CompanyResponse>>> getPendingCompanies() {
        List<Company> companies = companyRepository.findByStatus(CompanyStatus.PENDING);
        List<CompanyResponse> response = companies.stream()
                .map(this::mapCompanyToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(response, "Pending companies"));
    }

    /**
     * Approve company
     */
    @PutMapping("/companies/{id}/approve")
    public ResponseEntity<ApiResponse<CompanyResponse>> approveCompany(@PathVariable Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", id));

        company.setStatus(CompanyStatus.APPROVED);
        Company saved = companyRepository.save(company);

        // Notify company owner
        if (notificationService != null) {
            notificationService.sendWithEmail(
                    company.getUser().getId(),
                    "Company Approved!",
                    "Congratulations! Your company has been verified and approved.",
                    NotificationType.SUCCESS,
                    "/dashboard");
        }

        if (emailService != null) {
            emailService.sendCompanyApprovedEmail(
                    company.getUser().getEmail(),
                    company.getUser().getName());
        }

        return ResponseEntity.ok(ApiResponse.success(mapCompanyToResponse(saved), "Company approved successfully"));
    }

    /**
     * Decline company
     */
    @PutMapping("/companies/{id}/decline")
    public ResponseEntity<ApiResponse<CompanyResponse>> declineCompany(
            @PathVariable Long id,
            @RequestParam String reason) {

        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", id));

        company.setStatus(CompanyStatus.DECLINED);
        Company saved = companyRepository.save(company);

        // Notify company owner
        if (notificationService != null) {
            notificationService.send(
                    company.getUser().getId(),
                    "Company Verification Update",
                    "Your company verification was declined. Reason: " + reason,
                    NotificationType.WARNING,
                    null);
        }

        if (emailService != null) {
            emailService.sendCompanyDeclinedEmail(
                    company.getUser().getEmail(),
                    company.getUser().getName(),
                    reason);
        }

        return ResponseEntity.ok(ApiResponse.success(mapCompanyToResponse(saved), "Company declined"));
    }

    /**
     * Suspend company
     */
    @PutMapping("/companies/{id}/suspend")
    public ResponseEntity<ApiResponse<CompanyResponse>> suspendCompany(@PathVariable Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", id));

        company.setStatus(CompanyStatus.SUSPENDED);
        Company saved = companyRepository.save(company);

        return ResponseEntity.ok(ApiResponse.success(mapCompanyToResponse(saved), "Company suspended"));
    }

    /**
     * Get all users
     */
    @GetMapping("/users")
    public ResponseEntity<ApiResponse<List<UserResponse>>> getAllUsers() {
        List<User> users = userRepository.findAll();
        List<UserResponse> response = users.stream()
                .map(this::mapUserToResponse)
                .collect(Collectors.toList());
        return ResponseEntity.ok(ApiResponse.success(response, "All users"));
    }

    /**
     * Update user status (enable/disable)
     */
    @PutMapping("/users/{id}/status")
    public ResponseEntity<ApiResponse<UserResponse>> updateUserStatus(
            @PathVariable Long id,
            @RequestParam boolean enabled) {

        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", id));

        user.setEmailVerified(enabled);
        User saved = userRepository.save(user);

        return ResponseEntity.ok(ApiResponse.success(mapUserToResponse(saved), "User status updated"));
    }

    /**
     * Get all contracts
     */
    @GetMapping("/contracts")
    public ResponseEntity<ApiResponse<List<ContractResponse>>> getAllContracts() {
        // Simplified - would use ContractService
        return ResponseEntity.ok(ApiResponse.success(List.of(), "All contracts"));
    }

    /**
     * Get all payments
     */
    @GetMapping("/payments")
    public ResponseEntity<ApiResponse<List<PaymentResponse>>> getAllPayments() {
        // Simplified - would use PaymentService
        return ResponseEntity.ok(ApiResponse.success(List.of(), "All payments"));
    }

    /**
     * Get analytics
     */
    @GetMapping("/analytics")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getAnalytics() {
        Map<String, Object> analytics = new HashMap<>();

        // Monthly statistics, growth trends, etc.
        analytics.put("message", "Analytics data - to be implemented");

        return ResponseEntity.ok(ApiResponse.success(analytics, "Analytics"));
    }

    private CompanyResponse mapCompanyToResponse(Company company) {
        CompanyResponse response = new CompanyResponse();
        response.setId(company.getId());
        response.setUserId(company.getUser().getId());
        response.setRegistrationNo(company.getRegistrationNo());
        response.setDescription(company.getDescription());
        response.setEstablishedYear(company.getEstablishedYear());
        response.setServiceCategory(company.getServiceCategory());
        response.setWebsiteUrl(company.getWebsiteUrl());
        response.setPriceRangeMin(company.getPriceRangeMin());
        response.setPriceRangeMax(company.getPriceRangeMax());
        response.setAvgDeliveryTime(company.getAvgDeliveryTime());
        response.setAverageRating(company.getAverageRating());
        response.setStatus(company.getStatus());
        response.setCreatedAt(company.getCreatedAt());
        response.setUpdatedAt(company.getUpdatedAt());
        return response;
    }

    private UserResponse mapUserToResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setName(user.getName());
        response.setEmail(user.getEmail());
        response.setPhone(user.getPhone());
        response.setAddress(user.getAddress());
        response.setRole(user.getRole());
        response.setEmailVerified(user.getEmailVerified());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());
        return response;
    }
}
