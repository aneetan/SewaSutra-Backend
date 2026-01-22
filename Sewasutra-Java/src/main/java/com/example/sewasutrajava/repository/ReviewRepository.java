package com.example.demo.repository;

import com.example.demo.model.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository for Review entity.
 * Manages company reviews and ratings.
 */
@Repository
public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByCompanyIdOrderByCreatedAtDesc(Long companyId);

    List<Review> findByClientId(Long clientId);

    Optional<Review> findByContractId(Long contractId);

    @Query("SELECT AVG(r.rating) FROM Review r WHERE r.company.id = :companyId")
    Double calculateAverageRatingByCompanyId(@Param("companyId") Long companyId);

    @Query("SELECT COUNT(r) FROM Review r WHERE r.company.id = :companyId")
    Long countByCompanyId(@Param("companyId") Long companyId);

    @Query("SELECT r FROM Review r WHERE r.client.id = :clientId AND r.contract.status = 'COMPLETED' " +
            "AND NOT EXISTS (SELECT 1 FROM Review r2 WHERE r2.contract.id = r.contract.id)")
    List<Review> findPendingReviewsByClientId(@Param("clientId") Long clientId);

    boolean existsByContractId(Long contractId);
}
