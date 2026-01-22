package com.example.demo.repository;

import com.example.demo.enums.ContractStatus;
import com.example.demo.model.Contract;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Contract entity.
 * Manages formal agreements between clients and companies.
 */
@Repository
public interface ContractRepository extends JpaRepository<Contract, Long> {

    List<Contract> findByClientId(Long clientId);

    List<Contract> findByCompanyId(Long companyId);

    List<Contract> findByStatus(ContractStatus status);

    List<Contract> findByRequirementId(Long requirementId);

    @Query("SELECT c FROM Contract c WHERE c.client.id = :userId OR c.company.user.id = :userId")
    List<Contract> findByUserId(@Param("userId") Long userId);

    @Query("SELECT c FROM Contract c WHERE c.status = 'ACTIVE' AND c.company.id = :companyId")
    List<Contract> findActiveByCompanyId(@Param("companyId") Long companyId);

    @Query("SELECT c FROM Contract c WHERE c.status = 'PENDING' AND (c.clientSigned = false OR c.companySigned = false)")
    List<Contract> findPendingSignatures();

    @Query("SELECT COUNT(c) FROM Contract c WHERE c.company.id = :companyId AND c.status = 'COMPLETED'")
    Long countCompletedByCompanyId(@Param("companyId") Long companyId);
}
