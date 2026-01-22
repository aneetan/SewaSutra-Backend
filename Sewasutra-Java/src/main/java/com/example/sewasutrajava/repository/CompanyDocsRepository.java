package com.example.demo.repository;

import com.example.demo.model.CompanyDocs;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CompanyDocsRepository extends JpaRepository<CompanyDocs, Long> {
    Optional<CompanyDocs> findByCompanyId(Long companyId);
}
