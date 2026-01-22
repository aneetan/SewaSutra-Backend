package com.example.demo.service;

import com.example.demo.dto.request.ReviewRequest;
import com.example.demo.dto.response.ReviewResponse;

import java.util.List;

public interface ReviewService {

    ReviewResponse submitReview(ReviewRequest request, Long clientId);

    ReviewResponse getReviewById(Long id);

    List<ReviewResponse> getReviewsByCompany(Long companyId);

    List<ReviewResponse> getReviewsByClient(Long clientId);

    ReviewResponse updateReview(Long id, ReviewRequest request, Long clientId);

    void deleteReview(Long id, Long userId); // Admin or within 24 hours

    // Auto-calculate and update company rating
    void updateCompanyRating(Long companyId);
}
