package com.example.demo.service;

import com.example.demo.dto.request.RequirementRequest;
import com.example.demo.dto.response.CompanyRecommendation;
import com.example.demo.dto.response.RequirementResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface RequirementService {

    RequirementResponse createRequirement(RequirementRequest request, Long userId);

    RequirementResponse getRequirementById(Long id);

    Page<RequirementResponse> getAllRequirements(Pageable pageable);

    List<RequirementResponse> getRequirementsByUser(Long userId);

    List<RequirementResponse> getOpenRequirements();

    RequirementResponse updateRequirement(Long id, RequirementRequest request, Long userId);

    void deleteRequirement(Long id, Long userId);

    List<RequirementResponse> searchRequirements(String status, String category,
            String urgency, Integer minBudget, Integer maxBudget);

    // AI-powered company recommendations
    List<CompanyRecommendation> getRecommendedCompanies(Long requirementId, int limit);
}
