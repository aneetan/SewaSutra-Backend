package com.example.demo.repository;

import com.example.demo.enums.QuoteStatus;
import com.example.demo.model.Quote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * Repository for Quote entity.
 * Handles company proposals on client requirements.
 */
@Repository
public interface QuoteRepository extends JpaRepository<Quote, Long> {

    List<Quote> findByRequirementId(Long requirementId);

    List<Quote> findByCompanyId(Long companyId);

    List<Quote> findByStatus(QuoteStatus status);

    @Query("SELECT q FROM Quote q WHERE q.requirement.user.id = :clientId")
    List<Quote> findByClientId(@Param("clientId") Long clientId);

    Optional<Quote> findByRequirementIdAndCompanyId(Long requirementId, Long companyId);

    @Query("SELECT q FROM Quote q WHERE q.company.id = :companyId AND q.status = 'PENDING'")
    List<Quote> findPendingByCompanyId(@Param("companyId") Long companyId);

    @Query("SELECT q FROM Quote q WHERE q.requirement.id = :requirementId ORDER BY q.amount ASC")
    List<Quote> findByRequirementIdOrderByAmountAsc(@Param("requirementId") Long requirementId);

    @Query("SELECT q FROM Quote q WHERE q.validUntil < :now AND q.status = 'PENDING'")
    List<Quote> findExpiredQuotes(@Param("now") LocalDateTime now);

    @Query("SELECT COUNT(q) FROM Quote q WHERE q.requirement.id = :requirementId")
    Long countByRequirementId(@Param("requirementId") Long requirementId);
}
