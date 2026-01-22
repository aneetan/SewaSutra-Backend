package com.example.demo.service.impl;

import com.example.demo.dto.request.RequirementRequest;
import com.example.demo.dto.response.CompanyRecommendation;
import com.example.demo.dto.response.RequirementResponse;
import com.example.demo.enums.CompanyStatus;
import com.example.demo.enums.RequirementStatus;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.exception.UnauthorizedException;
import com.example.demo.model.Company;
import com.example.demo.model.Requirement;
import com.example.demo.model.User;
import com.example.demo.repository.CompanyRepository;
import com.example.demo.repository.QuoteRepository;
import com.example.demo.repository.RequirementRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.RequirementService;
import com.example.demo.service.EmbeddingService;
import com.example.demo.service.PineconeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@Transactional
public class RequirementServiceImpl implements RequirementService {

    @Autowired
    private RequirementRepository requirementRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private QuoteRepository quoteRepository;

    @Autowired
    private EmbeddingService embeddingService;

    @Autowired
    private PineconeService pineconeService;

    @Override
    public RequirementResponse createRequirement(RequirementRequest request, Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        if (request.getMaximumBudget() < request.getMinimumBudget()) {
            throw new BadRequestException("Maximum budget must be greater than minimum budget");
        }

        Requirement requirement = new Requirement();
        requirement.setTitle(request.getTitle());
        requirement.setDescription(request.getDescription());
        requirement.setWorkType(request.getWorkType());
        requirement.setMinimumBudget(request.getMinimumBudget());
        requirement.setMaximumBudget(request.getMaximumBudget());
        requirement.setCategory(request.getCategory());
        requirement.setTimeline(request.getTimeline());
        requirement.setSkills(request.getSkills());
        requirement.setAttachment(request.getAttachment());
        requirement.setUrgency(request.getUrgency());
        requirement.setStatus(RequirementStatus.OPEN);
        requirement.setUser(user);

        // AI: Generate embedding for similarity search
        List<Double> embedding = embeddingService
                .generateEmbedding(request.getTitle() + " " + request.getDescription());
        requirement.setEmbedding(embedding.toString());

        Requirement saved = requirementRepository.save(requirement);
        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public RequirementResponse getRequirementById(Long id) {
        Requirement requirement = requirementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Requirement", "id", id));
        return mapToResponse(requirement);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<RequirementResponse> getAllRequirements(Pageable pageable) {
        return requirementRepository.findAll(pageable).map(this::mapToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RequirementResponse> getRequirementsByUser(Long userId) {
        return requirementRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<RequirementResponse> getOpenRequirements() {
        return requirementRepository.findOpenRequirements().stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public RequirementResponse updateRequirement(Long id, RequirementRequest request, Long userId) {
        Requirement requirement = requirementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Requirement", "id", id));

        if (!requirement.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You can only update your own requirements");
        }

        if (requirement.getStatus() != RequirementStatus.OPEN) {
            throw new BadRequestException("Cannot update requirement that is not OPEN");
        }

        requirement.setTitle(request.getTitle());
        requirement.setDescription(request.getDescription());
        requirement.setWorkType(request.getWorkType());
        requirement.setMinimumBudget(request.getMinimumBudget());
        requirement.setMaximumBudget(request.getMaximumBudget());
        requirement.setCategory(request.getCategory());
        requirement.setTimeline(request.getTimeline());
        requirement.setSkills(request.getSkills());
        requirement.setAttachment(request.getAttachment());
        requirement.setUrgency(request.getUrgency());

        Requirement saved = requirementRepository.save(requirement);
        return mapToResponse(saved);
    }

    @Override
    public void deleteRequirement(Long id, Long userId) {
        Requirement requirement = requirementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Requirement", "id", id));

        if (!requirement.getUser().getId().equals(userId)) {
            throw new UnauthorizedException("You can only delete your own requirements");
        }

        requirementRepository.delete(requirement);
    }

    @Override
    @Transactional(readOnly = true)
    public List<RequirementResponse> searchRequirements(String status, String category,
            String urgency, Integer minBudget, Integer maxBudget) {
        return requirementRepository.advancedSearch(status, category, urgency, minBudget, maxBudget)
                .stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompanyRecommendation> getRecommendedCompanies(Long requirementId, int limit) {
        Requirement requirement = requirementRepository.findById(requirementId)
                .orElseThrow(() -> new ResourceNotFoundException("Requirement", "id", requirementId));

        // Get all verified companies
        List<Company> companies = companyRepository.findByStatus(CompanyStatus.APPROVED);

        // Filter by category
        companies = companies.stream()
                .filter(c -> c.getServiceCategory() != null &&
                        c.getServiceCategory().toLowerCase().contains(requirement.getCategory().toLowerCase()))
                .collect(Collectors.toList());

        // AI: Get semantic similarity scores from Pinecone
        List<Double> reqEmbedding = embeddingService
                .generateEmbedding(requirement.getTitle() + " " + requirement.getDescription());
        // For simulation, we assume Pinecone returns IDs and we map them to scores
        // In reality, search Pinecone and get scores for these company IDs

        // Calculate weighted scores for each company
        List<CompanyRecommendation> recommendations = new ArrayList<>();

        for (Company company : companies) {
            CompanyRecommendation rec = new CompanyRecommendation();
            rec.setCompanyId(company.getId());
            rec.setCompanyName(company.getUser().getName()); // Company user's name
            rec.setDescription(company.getDescription());
            rec.setServiceCategory(company.getServiceCategory());
            rec.setAverageRating(company.getAverageRating() != null ? company.getAverageRating() : 0.0);
            rec.setTotalProjects(company.getTotalProjects() != null ? company.getTotalProjects() : 0);
            rec.setPriceRangeMin(company.getPriceRangeMin());
            rec.setPriceRangeMax(company.getPriceRangeMax());
            rec.setAvgDeliveryTime(company.getAvgDeliveryTime());

            // Calculate individual scores
            double skillsScore = calculateSkillsMatch(requirement.getSkills(), company.getServiceCategory());
            double budgetScore = calculateBudgetCompatibility(requirement, company);
            double ratingScore = (company.getAverageRating() != null ? company.getAverageRating() : 0) / 5.0;
            double deliveryScore = 0.5; // Simplified - would parse and compare delivery times
            double performanceScore = Math.min(1.0,
                    (company.getTotalProjects() != null ? company.getTotalProjects() : 0) / 10.0);

            // Weighted scoring: Skills 30%, Budget 25%, Rating 20%, Delivery 15%,
            // Performance 10%
            double overallScore = (skillsScore * 0.30) + (budgetScore * 0.25) +
                    (ratingScore * 0.20) + (deliveryScore * 0.15) + (performanceScore * 0.10);

            rec.setSkillsMatchScore(skillsScore);
            rec.setBudgetCompatibilityScore(budgetScore);
            rec.setRatingScore(ratingScore);
            rec.setDeliveryTimeScore(deliveryScore);
            rec.setPerformanceScore(performanceScore);
            rec.setOverallScore(overallScore);

            recommendations.add(rec);
        }

        // Sort by overall score descending and limit
        return recommendations.stream()
                .sorted(Comparator.comparingDouble(CompanyRecommendation::getOverallScore).reversed())
                .limit(limit)
                .collect(Collectors.toList());
    }

    private double calculateSkillsMatch(String requiredSkills, String companyServices) {
        if (requiredSkills == null || companyServices == null)
            return 0.3;

        Set<String> required = Arrays.stream(requiredSkills.toLowerCase().split(","))
                .map(String::trim)
                .collect(Collectors.toSet());
        Set<String> offered = Arrays.stream(companyServices.toLowerCase().split(","))
                .map(String::trim)
                .collect(Collectors.toSet());

        long matches = required.stream().filter(offered::contains).count();
        return required.isEmpty() ? 0.5 : (double) matches / required.size();
    }

    private double calculateBudgetCompatibility(Requirement req, Company company) {
        if (company.getPriceRangeMin() == null || company.getPriceRangeMax() == null)
            return 0.5;
        if (req.getMinimumBudget() == null || req.getMaximumBudget() == null)
            return 0.5;

        // Check if budget ranges overlap
        boolean overlaps = req.getMaximumBudget() >= company.getPriceRangeMin() &&
                req.getMinimumBudget() <= company.getPriceRangeMax();

        return overlaps ? 1.0 : 0.2;
    }

    private RequirementResponse mapToResponse(Requirement req) {
        RequirementResponse response = new RequirementResponse();
        response.setId(req.getId());
        response.setTitle(req.getTitle());
        response.setDescription(req.getDescription());
        response.setWorkType(req.getWorkType());
        response.setMinimumBudget(req.getMinimumBudget());
        response.setMaximumBudget(req.getMaximumBudget());
        response.setCategory(req.getCategory());
        response.setTimeline(req.getTimeline());
        response.setSkills(req.getSkills());
        response.setAttachment(req.getAttachment());
        response.setUrgency(req.getUrgency());
        response.setStatus(req.getStatus());
        response.setCreatedAt(req.getCreatedAt());
        response.setUpdatedAt(req.getUpdatedAt());
        response.setUserId(req.getUser().getId());
        response.setUserName(req.getUser().getName());
        response.setQuoteCount(quoteRepository.countByRequirementId(req.getId()).intValue());
        return response;
    }
}
