package com.example.demo.repository;

import com.example.demo.enums.CompanyStatus;
import com.example.demo.model.Company;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompanyRepository extends JpaRepository<Company, Long> {

    List<Company> findByStatus(CompanyStatus status);

    List<Company> findByUserId(Long userId);

    List<Company> findByServiceCategoryContainingIgnoreCase(String category);

    List<Company> findByPriceRangeMinLessThanEqualAndPriceRangeMaxGreaterThanEqual(
            Integer minPrice, Integer maxPrice);

    @Query("SELECT c FROM Company c WHERE " +
            "(:category IS NULL OR LOWER(c.serviceCategory) LIKE LOWER(CONCAT('%', :category, '%'))) AND " +
            "(:minPrice IS NULL OR c.priceRangeMin <= :minPrice) AND " +
            "(:maxPrice IS NULL OR c.priceRangeMax >= :maxPrice) AND " +
            "(:status IS NULL OR c.status = :status)")
    List<Company> searchCompanies(
            @Param("category") String category,
            @Param("minPrice") Integer minPrice,
            @Param("maxPrice") Integer maxPrice,
            @Param("status") CompanyStatus status);
}
