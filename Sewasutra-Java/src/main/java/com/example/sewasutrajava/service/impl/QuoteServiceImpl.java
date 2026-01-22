package com.example.demo.service.impl;

import com.example.demo.dto.request.QuoteRequest;
import com.example.demo.dto.response.ContractResponse;
import com.example.demo.dto.response.QuoteResponse;
import com.example.demo.enums.CompanyStatus;
import com.example.demo.enums.NotificationType;
import com.example.demo.enums.QuoteStatus;
import com.example.demo.enums.RequirementStatus;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.exception.UnauthorizedException;
import com.example.demo.model.Company;
import com.example.demo.model.Quote;
import com.example.demo.model.Requirement;
import com.example.demo.repository.CompanyRepository;
import com.example.demo.repository.QuoteRepository;
import com.example.demo.repository.RequirementRepository;
import com.example.demo.service.ContractService;
import com.example.demo.service.NotificationService;
import com.example.demo.service.QuoteService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class QuoteServiceImpl implements QuoteService {

    @Autowired
    private QuoteRepository quoteRepository;

    @Autowired
    private RequirementRepository requirementRepository;

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private ContractService contractService;

    @Autowired(required = false)
    private NotificationService notificationService;

    @Override
    public QuoteResponse submitQuote(QuoteRequest request, Long companyId) {
        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", companyId));

        // Validate company is verified
        if (company.getStatus() != CompanyStatus.APPROVED) {
            throw new BadRequestException("Only verified companies can submit quotes");
        }

        Requirement requirement = requirementRepository.findById(request.getRequirementId())
                .orElseThrow(() -> new ResourceNotFoundException("Requirement", "id", request.getRequirementId()));

        // Validate requirement is open
        if (requirement.getStatus() != RequirementStatus.OPEN) {
            throw new BadRequestException("Cannot submit quote for requirement that is not OPEN");
        }

        // Check if company already submitted a quote
        if (quoteRepository.findByRequirementIdAndCompanyId(request.getRequirementId(), companyId).isPresent()) {
            throw new BadRequestException(
                    "You have already submitted a quote for this requirement. Use update instead.");
        }

        Quote quote = new Quote();
        quote.setRequirement(requirement);
        quote.setCompany(company);
        quote.setAmount(request.getAmount());
        quote.setDeliveryTime(request.getDeliveryTime());
        quote.setMessage(request.getMessage());
        quote.setBreakdown(request.getBreakdown());
        quote.setStatus(QuoteStatus.PENDING);
        quote.setValidUntil(LocalDateTime.now().plusDays(30)); // 30 days validity

        Quote saved = quoteRepository.save(quote);

        // Send notification to client
        if (notificationService != null) {
            notificationService.sendWithEmail(
                    requirement.getUser().getId(),
                    "New Quote Received",
                    "You received a quote from " + company.getUser().getName() + " for '" + requirement.getTitle()
                            + "'",
                    NotificationType.SUCCESS,
                    "/requirements/" + requirement.getId() + "/quotes");
        }

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public QuoteResponse getQuoteById(Long id) {
        Quote quote = quoteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quote", "id", id));
        return mapToResponse(quote);
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuoteResponse> getQuotesByRequirement(Long requirementId) {
        return quoteRepository.findByRequirementIdOrderByAmountAsc(requirementId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuoteResponse> getQuotesByCompany(Long companyId) {
        return quoteRepository.findByCompanyId(companyId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuoteResponse> getReceivedQuotes(Long clientId) {
        return quoteRepository.findByClientId(clientId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<QuoteResponse> getPendingQuotesForCompany(Long companyId) {
        return quoteRepository.findPendingByCompanyId(companyId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public QuoteResponse updateQuote(Long id, QuoteRequest request, Long companyId) {
        Quote quote = quoteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quote", "id", id));

        if (!quote.getCompany().getId().equals(companyId)) {
            throw new UnauthorizedException("You can only update your own quotes");
        }

        if (quote.getStatus() != QuoteStatus.PENDING) {
            throw new BadRequestException("Can only update PENDING quotes");
        }

        quote.setAmount(request.getAmount());
        quote.setDeliveryTime(request.getDeliveryTime());
        quote.setMessage(request.getMessage());
        quote.setBreakdown(request.getBreakdown());
        quote.setValidUntil(LocalDateTime.now().plusDays(30)); // Reset validity

        Quote saved = quoteRepository.save(quote);
        return mapToResponse(saved);
    }

    @Override
    public ContractResponse acceptQuote(Long quoteId, Long clientId) {
        Quote quote = quoteRepository.findById(quoteId)
                .orElseThrow(() -> new ResourceNotFoundException("Quote", "id", quoteId));

        Requirement requirement = quote.getRequirement();

        // Validate client owns the requirement
        if (!requirement.getUser().getId().equals(clientId)) {
            throw new UnauthorizedException("You can only accept quotes on your own requirements");
        }

        if (quote.getStatus() != QuoteStatus.PENDING) {
            throw new BadRequestException("This quote is no longer pending");
        }

        if (requirement.getStatus() != RequirementStatus.OPEN) {
            throw new BadRequestException("This requirement is no longer open for quotes");
        }

        // Accept this quote
        quote.setStatus(QuoteStatus.ACCEPTED);
        quoteRepository.save(quote);

        // Reject all other pending quotes for this requirement
        List<Quote> otherQuotes = quoteRepository.findByRequirementId(requirement.getId());
        for (Quote other : otherQuotes) {
            if (!other.getId().equals(quoteId) && other.getStatus() == QuoteStatus.PENDING) {
                other.setStatus(QuoteStatus.REJECTED);
                quoteRepository.save(other);

                // Notify rejected companies
                if (notificationService != null) {
                    notificationService.send(
                            other.getCompany().getUser().getId(),
                            "Quote Not Selected",
                            "Your quote for '" + requirement.getTitle() + "' was not selected",
                            NotificationType.INFO,
                            null);
                }
            }
        }

        // Update requirement status
        requirement.setStatus(RequirementStatus.IN_PROGRESS);
        requirementRepository.save(requirement);

        // AUTO-CREATE CONTRACT from accepted quote
        ContractResponse contract = contractService.createFromQuote(quote);

        // Notify company that their quote was accepted
        if (notificationService != null) {
            notificationService.sendWithEmail(
                    quote.getCompany().getUser().getId(),
                    "Quote Accepted!",
                    "Your quote for '" + requirement.getTitle() + "' has been accepted! Please sign the contract.",
                    NotificationType.SUCCESS,
                    "/contracts/" + contract.getId());
        }

        return contract;
    }

    @Override
    public QuoteResponse rejectQuote(Long quoteId, Long clientId) {
        Quote quote = quoteRepository.findById(quoteId)
                .orElseThrow(() -> new ResourceNotFoundException("Quote", "id", quoteId));

        if (!quote.getRequirement().getUser().getId().equals(clientId)) {
            throw new UnauthorizedException("You can only reject quotes on your own requirements");
        }

        if (quote.getStatus() != QuoteStatus.PENDING) {
            throw new BadRequestException("This quote is not pending");
        }

        quote.setStatus(QuoteStatus.REJECTED);
        Quote saved = quoteRepository.save(quote);

        // Notify company
        if (notificationService != null) {
            notificationService.send(
                    quote.getCompany().getUser().getId(),
                    "Quote Rejected",
                    "Your quote for '" + quote.getRequirement().getTitle() + "' was rejected",
                    NotificationType.WARNING,
                    null);
        }

        return mapToResponse(saved);
    }

    @Override
    public QuoteResponse withdrawQuote(Long quoteId, Long companyId) {
        Quote quote = quoteRepository.findById(quoteId)
                .orElseThrow(() -> new ResourceNotFoundException("Quote", "id", quoteId));

        if (!quote.getCompany().getId().equals(companyId)) {
            throw new UnauthorizedException("You can only withdraw your own quotes");
        }

        if (quote.getStatus() != QuoteStatus.PENDING) {
            throw new BadRequestException("Can only withdraw PENDING quotes");
        }

        quote.setStatus(QuoteStatus.WITHDRAWN);
        Quote saved = quoteRepository.save(quote);
        return mapToResponse(saved);
    }

    @Override
    public void deleteQuote(Long id, Long companyId) {
        Quote quote = quoteRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quote", "id", id));

        if (!quote.getCompany().getId().equals(companyId)) {
            throw new UnauthorizedException("You can only delete your own quotes");
        }

        quoteRepository.delete(quote);
    }

    private QuoteResponse mapToResponse(Quote quote) {
        QuoteResponse response = new QuoteResponse();
        response.setId(quote.getId());
        response.setRequirementId(quote.getRequirement().getId());
        response.setRequirementTitle(quote.getRequirement().getTitle());
        response.setCompanyId(quote.getCompany().getId());
        response.setCompanyName(quote.getCompany().getUser().getName());
        response.setCompanyRating(quote.getCompany().getAverageRating());
        response.setAmount(quote.getAmount());
        response.setDeliveryTime(quote.getDeliveryTime());
        response.setMessage(quote.getMessage());
        response.setBreakdown(quote.getBreakdown());
        response.setStatus(quote.getStatus());
        response.setValidUntil(quote.getValidUntil());
        response.setCreatedAt(quote.getCreatedAt());
        response.setUpdatedAt(quote.getUpdatedAt());
        return response;
    }
}
