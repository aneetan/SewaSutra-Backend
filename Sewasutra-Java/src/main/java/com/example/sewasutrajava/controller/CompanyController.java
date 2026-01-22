package com.example.demo.controller;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.request.CompanyRequest;
import com.example.demo.dto.response.CompanyResponse;
import com.example.demo.enums.CompanyStatus;
import com.example.demo.service.CompanyService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/companies")
public class CompanyController {

    @Autowired
    private CompanyService companyService;

    @PostMapping
    @PreAuthorize("hasRole('PROVIDER')")
    public ResponseEntity<ApiResponse<CompanyResponse>> createCompany(
            @Valid @RequestBody CompanyRequest request) {
        CompanyResponse company = companyService.createCompany(request);
        ApiResponse<CompanyResponse> response = ApiResponse.success(company,
                "Company created successfully. Pending admin approval.");
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<CompanyResponse>> getCompanyById(@PathVariable Long id) {
        CompanyResponse company = companyService.getCompanyById(id);
        ApiResponse<CompanyResponse> response = ApiResponse.success(company, "Company fetched successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<ApiResponse<Page<CompanyResponse>>> getAllCompanies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy) {

        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, sortBy));
        Page<CompanyResponse> companies = companyService.getAllCompanies(pageable);
        ApiResponse<Page<CompanyResponse>> response = ApiResponse.success(companies, "Companies fetched successfully");
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('PROVIDER') or hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CompanyResponse>> updateCompany(
            @PathVariable Long id,
            @Valid @RequestBody CompanyRequest request) {
        CompanyResponse company = companyService.updateCompany(id, request);
        ApiResponse<CompanyResponse> response = ApiResponse.success(company, "Company updated successfully");
        return ResponseEntity.ok(response);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteCompany(@PathVariable Long id) {
        companyService.deleteCompany(id);
        ApiResponse<Void> response = ApiResponse.success("Company deleted successfully");
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CompanyResponse>> approveCompany(@PathVariable Long id) {
        CompanyResponse company = companyService.approveCompany(id);
        ApiResponse<CompanyResponse> response = ApiResponse.success(company, "Company approved successfully");
        return ResponseEntity.ok(response);
    }

    @PatchMapping("/{id}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<CompanyResponse>> rejectCompany(@PathVariable Long id) {
        CompanyResponse company = companyService.rejectCompany(id);
        ApiResponse<CompanyResponse> response = ApiResponse.success(company, "Company rejected");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<CompanyResponse>>> searchCompanies(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) Integer minPrice,
            @RequestParam(required = false) Integer maxPrice,
            @RequestParam(required = false) CompanyStatus status) {

        List<CompanyResponse> companies = companyService.searchCompanies(category, minPrice, maxPrice, status);
        ApiResponse<List<CompanyResponse>> response = ApiResponse.success(companies, "Search completed successfully");
        return ResponseEntity.ok(response);
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<CompanyResponse>>> getCompaniesByUser(@PathVariable Long userId) {
        List<CompanyResponse> companies = companyService.getCompaniesByUser(userId);
        ApiResponse<List<CompanyResponse>> response = ApiResponse.success(companies,
                "User companies fetched successfully");
        return ResponseEntity.ok(response);
    }
}
