package com.example.demo.controller;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.request.ReviewRequest;
import com.example.demo.dto.response.ReviewResponse;
import com.example.demo.security.UserPrincipal;
import com.example.demo.service.ReviewService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    @Autowired
    private ReviewService reviewService;

    /**
     * Submit a review (CLIENT only, after contract completion)
     */
    @PostMapping
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ApiResponse<ReviewResponse>> submitReview(
            @Valid @RequestBody ReviewRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        ReviewResponse response = reviewService.submitReview(request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(response, "Review submitted successfully"));
    }

    /**
     * Get review by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ReviewResponse>> getReviewById(@PathVariable Long id) {
        ReviewResponse response = reviewService.getReviewById(id);
        return ResponseEntity.ok(ApiResponse.success(response, "Review fetched"));
    }

    /**
     * Get reviews for a company (public)
     */
    @GetMapping("/by-company/{companyId}")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getReviewsByCompany(
            @PathVariable Long companyId) {
        List<ReviewResponse> response = reviewService.getReviewsByCompany(companyId);
        return ResponseEntity.ok(ApiResponse.success(response, "Company reviews fetched"));
    }

    /**
     * Get my reviews (CLIENT)
     */
    @GetMapping("/my-reviews")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ApiResponse<List<ReviewResponse>>> getMyReviews(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        List<ReviewResponse> response = reviewService.getReviewsByClient(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(response, "Your reviews fetched"));
    }

    /**
     * Update review (within 24 hours)
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('CLIENT')")
    public ResponseEntity<ApiResponse<ReviewResponse>> updateReview(
            @PathVariable Long id,
            @Valid @RequestBody ReviewRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        ReviewResponse response = reviewService.updateReview(id, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(response, "Review updated successfully"));
    }

    /**
     * Delete review (within 24 hours or ADMIN)
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteReview(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        reviewService.deleteReview(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(null, "Review deleted"));
    }
}
