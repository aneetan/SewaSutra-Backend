package com.example.demo.service.impl;

import com.example.demo.dto.request.ReviewRequest;
import com.example.demo.dto.response.ReviewResponse;
import com.example.demo.enums.ContractStatus;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.exception.UnauthorizedException;
import com.example.demo.model.Company;
import com.example.demo.model.Contract;
import com.example.demo.model.Review;
import com.example.demo.model.User;
import com.example.demo.repository.CompanyRepository;
import com.example.demo.repository.ContractRepository;
import com.example.demo.repository.ReviewRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.ReviewService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ReviewServiceImpl implements ReviewService {

    @Autowired
    private ReviewRepository reviewRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private ContractRepository contractRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public ReviewResponse submitReview(ReviewRequest request, Long clientId) {
        User client = userRepository.findById(clientId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", clientId));

        Company company = companyRepository.findById(request.getCompanyId())
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", request.getCompanyId()));

        Contract contract = contractRepository.findById(request.getContractId())
                .orElseThrow(() -> new ResourceNotFoundException("Contract", "id", request.getContractId()));

        // Validate client was part of this contract
        if (!contract.getClient().getId().equals(clientId)) {
            throw new UnauthorizedException("You can only review companies from your contracts");
        }

        // Validate contract is completed
        if (contract.getStatus() != ContractStatus.COMPLETED) {
            throw new BadRequestException("Can only review after contract completion");
        }

        // Check if already reviewed
        if (reviewRepository.existsByContractId(request.getContractId())) {
            throw new BadRequestException("You have already reviewed this contract");
        }

        Review review = new Review();
        review.setCompany(company);
        review.setClient(client);
        review.setContract(contract);
        review.setRating(request.getRating());
        review.setComment(request.getComment());

        Review saved = reviewRepository.save(review);

        // Update company rating and project count
        updateCompanyRating(company.getId());

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ReviewResponse getReviewById(Long id) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", id));
        return mapToResponse(review);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByCompany(Long companyId) {
        return reviewRepository.findByCompanyIdOrderByCreatedAtDesc(companyId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByClient(Long clientId) {
        return reviewRepository.findByClientId(clientId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ReviewResponse updateReview(Long id, ReviewRequest request, Long clientId) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", id));

        if (!review.getClient().getId().equals(clientId)) {
            throw new UnauthorizedException("You can only update your own reviews");
        }

        // Check 24-hour edit window
        if (ChronoUnit.HOURS.between(review.getCreatedAt(), LocalDateTime.now()) > 24) {
            throw new BadRequestException("Reviews can only be edited within 24 hours of submission");
        }

        review.setRating(request.getRating());
        review.setComment(request.getComment());

        Review saved = reviewRepository.save(review);

        // Recalculate company rating
        updateCompanyRating(review.getCompany().getId());

        return mapToResponse(saved);
    }

    @Override
    public void deleteReview(Long id, Long userId) {
        Review review = reviewRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Review", "id", id));

        // Check if user is the client (within 24 hours) or admin
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        boolean isOwner = review.getClient().getId().equals(userId);
        boolean isAdmin = user.getRole().name().equals("ADMIN");
        boolean within24Hours = ChronoUnit.HOURS.between(review.getCreatedAt(), LocalDateTime.now()) <= 24;

        if (!isAdmin && (!isOwner || !within24Hours)) {
            throw new UnauthorizedException("Cannot delete this review");
        }

        Long companyId = review.getCompany().getId();
        reviewRepository.delete(review);

        // Recalculate company rating
        updateCompanyRating(companyId);
    }

    @Override
    public void updateCompanyRating(Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", companyId));

        Double avgRating = reviewRepository.calculateAverageRatingByCompanyId(companyId);
        Long totalReviews = reviewRepository.countByCompanyId(companyId);
        Long completedContracts = contractRepository.countCompletedByCompanyId(companyId);

        company.setAverageRating(avgRating != null ? avgRating : 0.0);
        company.setTotalProjects(completedContracts.intValue());

        companyRepository.save(company);
    }

    private ReviewResponse mapToResponse(Review review) {
        ReviewResponse response = new ReviewResponse();
        response.setId(review.getId());
        response.setCompanyId(review.getCompany().getId());
        response.setCompanyName(review.getCompany().getUser().getName());
        response.setClientId(review.getClient().getId());
        response.setClientName(review.getClient().getName());
        response.setContractId(review.getContract() != null ? review.getContract().getId() : null);
        response.setRating(review.getRating());
        response.setComment(review.getComment());
        response.setCreatedAt(review.getCreatedAt());

        return response;
    }
}
