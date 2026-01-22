package com.example.demo.service.impl;

import com.example.demo.dto.response.ContractResponse;
import com.example.demo.enums.ContractStatus;
import com.example.demo.enums.NotificationType;
import com.example.demo.enums.ServiceType;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.exception.UnauthorizedException;
import com.example.demo.model.Contract;
import com.example.demo.model.Quote;
import com.example.demo.repository.AppPaymentRepository;
import com.example.demo.repository.ContractRepository;
import com.example.demo.service.ContractService;
import com.example.demo.service.NotificationService;
import com.example.demo.service.PdfService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@Transactional
public class ContractServiceImpl implements ContractService {

    @Autowired
    private ContractRepository contractRepository;

    @Autowired
    private AppPaymentRepository appPaymentRepository;

    @Autowired(required = false)
    private NotificationService notificationService;

    @Autowired
    private PdfService pdfService;

    @Override
    public ContractResponse createFromQuote(Quote quote) {
        Contract contract = new Contract();

        // Generate unique project ID
        contract.setProjectId("PRJ-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());

        // Set relationships
        contract.setRequirement(quote.getRequirement());
        contract.setQuote(quote);
        contract.setCompany(quote.getCompany());
        contract.setClient(quote.getRequirement().getUser());

        // Set contract details from quote
        contract.setAmount(quote.getAmount());
        contract.setServiceType(ServiceType.valueOf(quote.getRequirement().getWorkType()));

        // Default advance percent (30%)
        contract.setAdvancePercent(30);
        contract.setAdvanceAmount(quote.getAmount() * 0.30);

        // Parse delivery time to days (simplified)
        contract.setDurationDays(30); // Default 30 days

        // Set initial status
        contract.setStatus(ContractStatus.PENDING);
        contract.setPaymentStatus("UNPAID");

        // Both parties need to sign
        contract.setClientSigned(false);
        contract.setCompanySigned(false);

        // Scope from requirement
        contract.setScopeSummary(quote.getRequirement().getDescription());

        // Default terms
        contract.setTermsAndConditions(generateDefaultTerms(contract));

        Contract saved = contractRepository.save(contract);

        // Generate PDF contract
        try {
            String pdfUrl = pdfService.generateContractPdf(saved);
            saved.setContractFile(pdfUrl);
            contractRepository.save(saved);
        } catch (Exception e) {
            // Log error but don't fail for the demo
            System.err.println("Error generating PDF: " + e.getMessage());
        }

        return mapToResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public ContractResponse getContractById(Long id) {
        Contract contract = contractRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contract", "id", id));
        return mapToResponse(contract);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContractResponse> getContractsByUser(Long userId) {
        return contractRepository.findByUserId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContractResponse> getContractsByCompany(Long companyId) {
        return contractRepository.findByCompanyId(companyId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ContractResponse> getContractsByClient(Long clientId) {
        return contractRepository.findByClientId(clientId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public ContractResponse signContract(Long contractId, Long userId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ResourceNotFoundException("Contract", "id", contractId));

        if (contract.getStatus() != ContractStatus.PENDING) {
            throw new BadRequestException("Contract is not in PENDING status");
        }

        boolean isClient = contract.getClient().getId().equals(userId);
        boolean isCompany = contract.getCompany().getUser().getId().equals(userId);

        if (!isClient && !isCompany) {
            throw new UnauthorizedException("You are not a party to this contract");
        }

        if (isClient) {
            if (contract.getClientSigned()) {
                throw new BadRequestException("You have already signed this contract");
            }
            contract.setClientSigned(true);
            contract.setClientSignedAt(LocalDateTime.now());
        }

        if (isCompany) {
            if (contract.getCompanySigned()) {
                throw new BadRequestException("You have already signed this contract");
            }
            contract.setCompanySigned(true);
            contract.setCompanySignedAt(LocalDateTime.now());
        }

        // Check if both parties have signed
        if (contract.getClientSigned() && contract.getCompanySigned()) {
            contract.setStatus(ContractStatus.ACTIVE);
            contract.setStartDate(LocalDateTime.now());
            contract.setEndDate(LocalDateTime.now().plusDays(contract.getDurationDays()));

            // Notify both parties
            if (notificationService != null) {
                notificationService.sendWithEmail(
                        contract.getClient().getId(),
                        "Contract Signed!",
                        "The contract for '" + contract.getRequirement().getTitle() + "' is now active!",
                        NotificationType.CONTRACT_SIGNED,
                        "/contracts/" + contract.getId());
                notificationService.sendWithEmail(
                        contract.getCompany().getUser().getId(),
                        "Contract Signed!",
                        "The contract for '" + contract.getRequirement().getTitle() + "' is now active!",
                        NotificationType.CONTRACT_SIGNED,
                        "/contracts/" + contract.getId());
            }
        } else {
            // Notify the other party to sign
            Long otherPartyId = isClient ? contract.getCompany().getUser().getId() : contract.getClient().getId();
            if (notificationService != null) {
                notificationService.send(
                        otherPartyId,
                        "Contract Signed by Other Party",
                        "Please sign the contract for '" + contract.getRequirement().getTitle() + "'",
                        NotificationType.INFO,
                        "/contracts/" + contract.getId());
            }
        }

        Contract saved = contractRepository.save(contract);
        return mapToResponse(saved);
    }

    @Override
    public ContractResponse completeContract(Long contractId, Long userId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ResourceNotFoundException("Contract", "id", contractId));

        // Only company can mark as complete
        if (!contract.getCompany().getUser().getId().equals(userId)) {
            throw new UnauthorizedException("Only the service provider can mark contract as complete");
        }

        if (contract.getStatus() != ContractStatus.ACTIVE) {
            throw new BadRequestException("Contract must be ACTIVE to complete");
        }

        // Check if fully paid
        Double totalPaid = appPaymentRepository.getTotalPaidByContractId(contractId);
        if (totalPaid == null || totalPaid < contract.getTotalAmount()) {
            throw new BadRequestException("Contract payment is not complete. Total paid: " +
                    (totalPaid != null ? totalPaid : 0) + " / " + contract.getTotalAmount());
        }

        contract.setStatus(ContractStatus.COMPLETED);
        contract.setEndDate(LocalDateTime.now());
        contract.setPaymentStatus("PAID");

        Contract saved = contractRepository.save(contract);

        // Notify client to leave a review
        if (notificationService != null) {
            notificationService.sendWithEmail(
                    contract.getClient().getId(),
                    "Project Completed!",
                    "The project '" + contract.getRequirement().getTitle() + "' is complete. Please leave a review!",
                    NotificationType.SUCCESS,
                    "/reviews/new?contractId=" + contract.getId());
        }

        return mapToResponse(saved);
    }

    @Override
    public ContractResponse cancelContract(Long contractId, Long userId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ResourceNotFoundException("Contract", "id", contractId));

        boolean isParty = contract.getClient().getId().equals(userId) ||
                contract.getCompany().getUser().getId().equals(userId);

        if (!isParty) {
            throw new UnauthorizedException("You are not a party to this contract");
        }

        if (contract.getStatus() != ContractStatus.PENDING) {
            throw new BadRequestException("Can only cancel contracts in PENDING status");
        }

        contract.setStatus(ContractStatus.CANCELLED);
        Contract saved = contractRepository.save(contract);
        return mapToResponse(saved);
    }

    @Override
    public String generateContractPdf(Long contractId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ResourceNotFoundException("Contract", "id", contractId));
        return pdfService.generateContractPdf(contract);
    }

    @Override
    public String getContractDownloadUrl(Long contractId) {
        Contract contract = contractRepository.findById(contractId)
                .orElseThrow(() -> new ResourceNotFoundException("Contract", "id", contractId));
        return contract.getContractFile();
    }

    private String generateDefaultTerms(Contract contract) {
        return String.format("""
                Terms and Conditions:
                1. Project ID: %s
                2. Total Amount: NPR %,.2f
                3. Advance Payment: %d%% (NPR %,.2f) due upon contract signing
                4. Duration: %d days from contract activation
                5. Both parties must sign this contract for it to become active
                6. Either party may cancel within PENDING status
                7. Final payment required before project completion
                8. Platform commission: 5%% on all payments
                9. Disputes shall be resolved through platform mediation
                10. This is a legally binding agreement
                """,
                contract.getProjectId(),
                contract.getTotalAmount(),
                contract.getAdvancePercent(),
                contract.getAdvanceAmount(),
                contract.getDurationDays());
    }

    private ContractResponse mapToResponse(Contract contract) {
        ContractResponse response = new ContractResponse();
        response.setId(contract.getId());
        response.setProjectId(contract.getProjectId());
        response.setRequirementId(contract.getRequirement().getId());
        response.setRequirementTitle(contract.getRequirement().getTitle());
        response.setQuoteId(contract.getQuote() != null ? contract.getQuote().getId() : null);
        response.setCompanyId(contract.getCompany().getId());
        response.setCompanyName(contract.getCompany().getUser().getName());
        response.setClientId(contract.getClient().getId());
        response.setClientName(contract.getClient().getName());
        response.setServiceType(contract.getServiceType() != null ? contract.getServiceType().name() : null);
        response.setTotalAmount(contract.getAmount());
        response.setAdvancePercent(contract.getAdvancePercent());
        response.setAdvanceAmount(contract.getAdvanceAmount());
        response.setDurationDays(contract.getDurationDays());
        response.setScopeSummary(contract.getScopeSummary());
        response.setTermsAndConditions(contract.getTermsAndConditions());
        response.setStatus(contract.getStatus());
        response.setPaymentStatus(contract.getPaymentStatus());
        response.setClientSigned(contract.getClientSigned());
        response.setCompanySigned(contract.getCompanySigned());
        response.setClientSignedAt(contract.getClientSignedAt());
        response.setCompanySignedAt(contract.getCompanySignedAt());
        response.setContractFile(contract.getContractFile());
        response.setStartDate(contract.getStartDate());
        response.setEndDate(contract.getEndDate());
        response.setCreatedAt(contract.getCreatedAt());

        // Calculate payment info
        Double totalPaid = appPaymentRepository.getTotalPaidByContractId(contract.getId());
        response.setTotalPaid(totalPaid != null ? totalPaid : 0.0);
        response.setRemainingAmount(contract.getTotalAmount() - (totalPaid != null ? totalPaid : 0));

        return response;
    }
}
