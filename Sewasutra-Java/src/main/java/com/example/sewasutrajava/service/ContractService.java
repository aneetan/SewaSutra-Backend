package com.example.demo.service;

import com.example.demo.dto.response.ContractResponse;
import com.example.demo.model.Quote;

import java.util.List;

public interface ContractService {

    // Auto-create contract from accepted quote
    ContractResponse createFromQuote(Quote quote);

    ContractResponse getContractById(Long id);

    List<ContractResponse> getContractsByUser(Long userId);

    List<ContractResponse> getContractsByCompany(Long companyId);

    List<ContractResponse> getContractsByClient(Long clientId);

    // Digital signature
    ContractResponse signContract(Long contractId, Long userId);

    // Mark as complete
    ContractResponse completeContract(Long contractId, Long userId);

    ContractResponse cancelContract(Long contractId, Long userId);

    // Generate PDF
    String generateContractPdf(Long contractId);

    // Get download URL
    String getContractDownloadUrl(Long contractId);
}
