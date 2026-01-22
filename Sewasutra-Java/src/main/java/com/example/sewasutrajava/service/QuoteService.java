package com.example.demo.service;

import com.example.demo.dto.request.QuoteRequest;
import com.example.demo.dto.response.ContractResponse;
import com.example.demo.dto.response.QuoteResponse;

import java.util.List;

public interface QuoteService {

    QuoteResponse submitQuote(QuoteRequest request, Long companyId);

    QuoteResponse getQuoteById(Long id);

    List<QuoteResponse> getQuotesByRequirement(Long requirementId);

    List<QuoteResponse> getQuotesByCompany(Long companyId);

    List<QuoteResponse> getReceivedQuotes(Long clientId);

    List<QuoteResponse> getPendingQuotesForCompany(Long companyId);

    QuoteResponse updateQuote(Long id, QuoteRequest request, Long companyId);

    // Accept quote and auto-create contract
    ContractResponse acceptQuote(Long quoteId, Long clientId);

    QuoteResponse rejectQuote(Long quoteId, Long clientId);

    QuoteResponse withdrawQuote(Long quoteId, Long companyId);

    void deleteQuote(Long id, Long companyId);
}
