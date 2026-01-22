package com.example.demo.repository;

import com.example.demo.model.Requirement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Requirement entity.
 * Handles client project requirements with advanced search capabilities.
 */
@Repository
public interface RequirementRepository extends JpaRepository<Requirement, Long> {

    /**
     * Find requirements by user (client)
     */
    List<Requirement> findByUserId(Long userId);

    /**
     * Find requirements by status
     */
    List<Requirement> findByStatus(String status);

    /**
     * Find requirements by category
     */
    List<Requirement> findByCategory(String category);

    /**
     * Find requirements by urgency level
     */
    List<Requirement> findByUrgency(String urgency);

    /**
     * Search requirements by title or description
     */
    @Query("SELECT r FROM Requirement r WHERE " +
            "LOWER(r.title) LIKE LOWER(CONCAT('%', :keyword, '%')) OR " +
            "LOWER(r.description) LIKE LOWER(CONCAT('%', :keyword, '%'))")
    List<Requirement> searchByKeyword(@Param("keyword") String keyword);

    /**
     * Find requirements within budget range
     */
    @Query("SELECT r FROM Requirement r WHERE " +
            "r.minimumBudget <= :maxBudget AND r.maximumBudget >= :minBudget")
    List<Requirement> findByBudgetRange(
            @Param("minBudget") Integer minBudget,
            @Param("maxBudget") Integer maxBudget);

    /**
     * Advanced search with multiple filters
     */
    @Query("SELECT r FROM Requirement r WHERE " +
            "(:status IS NULL OR r.status = :status) AND " +
            "(:category IS NULL OR r.category = :category) AND " +
            "(:urgency IS NULL OR r.urgency = :urgency) AND " +
            "(:minBudget IS NULL OR r.maximumBudget >= :minBudget) AND " +
            "(:maxBudget IS NULL OR r.minimumBudget <= :maxBudget)")
    List<Requirement> advancedSearch(
            @Param("status") String status,
            @Param("category") String category,
            @Param("urgency") String urgency,
            @Param("minBudget") Integer minBudget,
            @Param("maxBudget") Integer maxBudget);

    /**
     * Find open requirements for companies to browse
     */
    @Query("SELECT r FROM Requirement r WHERE r.status = 'OPEN' ORDER BY r.createdAt DESC")
    List<Requirement> findOpenRequirements();
}
