package com.example.demo.repository;

import com.example.demo.model.CompanyPaymentMethod;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CompanyPaymentMethodRepository extends JpaRepository<CompanyPaymentMethod, Long> {
    List<CompanyPaymentMethod> findByCompanyId(Long companyId);

    Optional<CompanyPaymentMethod> findByCompanyIdAndIsDefaultTrue(Long companyId);
}
