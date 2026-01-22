package com.example.demo.service;

import com.example.demo.dto.request.CompanyRequest;
import com.example.demo.dto.response.CompanyResponse;
import com.example.demo.enums.CompanyStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface CompanyService {

    CompanyResponse createCompany(CompanyRequest request);

    CompanyResponse getCompanyById(Long id);

    Page<CompanyResponse> getAllCompanies(Pageable pageable);

    CompanyResponse updateCompany(Long id, CompanyRequest request);

    void deleteCompany(Long id);

    CompanyResponse approveCompany(Long id);

    CompanyResponse rejectCompany(Long id);

    List<CompanyResponse> searchCompanies(String category, Integer minPrice, Integer maxPrice, CompanyStatus status);

    List<CompanyResponse> getCompaniesByUser(Long userId);
}
