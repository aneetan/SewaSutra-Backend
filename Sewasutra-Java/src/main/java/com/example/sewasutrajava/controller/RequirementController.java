package com.example.demo.controller;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.request.RequirementRequest;
import com.example.demo.dto.response.CompanyRecommendation;
import com.example.demo.dto.response.RequirementResponse;
import com.example.demo.security.UserPrincipal;
import com.example.demo.service.RequirementService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/requirements")
public class RequirementController {

    @Autowired
    private RequirementService requirementService;

    /**
     * Create new requirement (CLIENT only)
     */
    @PostMapping
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ApiResponse<RequirementResponse>> createRequirement(
            @Valid @RequestBody RequirementRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        RequirementResponse response = requirementService.createRequirement(request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(response, "Requirement created successfully"));
    }

    /**
     * Get requirement by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<RequirementResponse>> getRequirementById(@PathVariable Long id) {
        RequirementResponse response = requirementService.getRequirementById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Requirement fetched"));
    }

    /**
     * Get all requirements (paginated)
     */
    @GetMapping
    public ResponseEntity<ApiResponse<Page<RequirementResponse>>> getAllRequirements(Pageable pageable) {
        Page<RequirementResponse> response = requirementService.getAllRequirements(pageable);
        return ResponseEntity.ok(ApiResponse.success(response, "Requirements fetched"));
    }

    /**
     * Get my requirements (CLIENT)
     */
    @GetMapping("/my-requirements")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ApiResponse<List<RequirementResponse>>> getMyRequirements(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<RequirementResponse> response = requirementService.getRequirementsByUser(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(response, "Your requirements fetched"));
    }

    /**
     * Get open requirements for companies to browse
     */
    @GetMapping("/open")
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ApiResponse<List<RequirementResponse>>> getOpenRequirements() {
        List<RequirementResponse> response = requirementService.getOpenRequirements();
        return ResponseEntity.ok(ApiResponse.success(response, "Open requirements fetched"));
    }

    /**
     * Search requirements with filters
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<RequirementResponse>>> searchRequirements(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String urgency,
            @RequestParam(required = false) Integer minBudget,
            @RequestParam(required = false) Integer maxBudget) {

        List<RequirementResponse> response = requirementService.searchRequirements(
                status, category, urgency, minBudget, maxBudget);
        return ResponseEntity.ok(ApiResponse.success(response, "Search results"));
    }

    /**
     * Get AI-powered company recommendations for a requirement
     */
    @GetMapping("/{id}/recommendations")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ApiResponse<List<CompanyRecommendation>>> getRecommendations(
            @PathVariable Long id,
            @RequestParam(defaultValue = "10") int limit) {

        List<CompanyRecommendation> response = requirementService.getRecommendedCompanies(id, limit);
        return ResponseEntity.ok(ApiResponse.success(response, "Top recommended companies"));
    }

    /**
     * Update requirement
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ApiResponse<RequirementResponse>> updateRequirement(
            @PathVariable Long id,
            @Valid @RequestBody RequirementRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        RequirementResponse response = requirementService.updateRequirement(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(response, "Requirement updated successfully"));
    }

    /**
     * Delete requirement
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ApiResponse<Void>> deleteRequirement(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        requirementService.deleteRequirement(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(null, "Requirement deleted successfully"));
    }
}
