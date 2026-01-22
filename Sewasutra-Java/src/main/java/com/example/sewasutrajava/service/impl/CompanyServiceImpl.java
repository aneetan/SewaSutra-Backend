package com.example.demo.service.impl;

import com.example.demo.dto.mapper.CompanyMapper;
import com.example.demo.dto.request.CompanyRequest;
import com.example.demo.dto.response.CompanyResponse;
import com.example.demo.enums.CompanyStatus;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.Company;
import com.example.demo.model.User;
import com.example.demo.repository.CompanyRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.CompanyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class CompanyServiceImpl implements CompanyService {

    @Autowired
    private CompanyRepository companyRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private CompanyMapper companyMapper;

    @Override
    public CompanyResponse createCompany(CompanyRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getUserId()));

        Company company = companyMapper.toEntity(request, user);
        company.setStatus(CompanyStatus.PENDING); // New companies start as PENDING

        Company savedCompany = companyRepository.save(company);
        return companyMapper.toResponse(savedCompany);
    }

    @Override
    @Transactional(readOnly = true)
    public CompanyResponse getCompanyById(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", id));
        return companyMapper.toResponse(company);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<CompanyResponse> getAllCompanies(Pageable pageable) {
        return companyRepository.findAll(pageable)
                .map(companyMapper::toResponse);
    }

    @Override
    public CompanyResponse updateCompany(Long id, CompanyRequest request) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", id));

        company.setRegistrationNo(request.getRegistrationNo());
        company.setDescription(request.getDescription());
        company.setEstablishedYear(request.getEstablishedYear());
        company.setServiceCategory(request.getServiceCategory());
        company.setWebsiteUrl(request.getWebsiteUrl());
        company.setPriceRangeMin(request.getPriceRangeMin());
        company.setPriceRangeMax(request.getPriceRangeMax());
        company.setAvgDeliveryTime(request.getAvgDeliveryTime());

        Company updatedCompany = companyRepository.save(company);
        return companyMapper.toResponse(updatedCompany);
    }

    @Override
    public void deleteCompany(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", id));
        companyRepository.delete(company);
    }

    @Override
    public CompanyResponse approveCompany(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", id));

        if (company.getStatus() != CompanyStatus.PENDING) {
            throw new BadRequestException("Only PENDING companies can be approved");
        }

        company.setStatus(CompanyStatus.APPROVED);
        Company approvedCompany = companyRepository.save(company);
        return companyMapper.toResponse(approvedCompany);
    }

    @Override
    public CompanyResponse rejectCompany(Long id) {
        Company company = companyRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Company", "id", id));

        if (company.getStatus() != CompanyStatus.PENDING) {
            throw new BadRequestException("Only PENDING companies can be rejected");
        }

        company.setStatus(CompanyStatus.REJECTED);
        Company rejectedCompany = companyRepository.save(company);
        return companyMapper.toResponse(rejectedCompany);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompanyResponse> searchCompanies(String category, Integer minPrice, Integer maxPrice,
            CompanyStatus status) {
        return companyRepository.searchCompanies(category, minPrice, maxPrice, status)
                .stream()
                .map(companyMapper::toResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CompanyResponse> getCompaniesByUser(Long userId) {
        return companyRepository.findByUserId(userId)
                .stream()
                .map(companyMapper::toResponse)
                .collect(Collectors.toList());
    }
}
