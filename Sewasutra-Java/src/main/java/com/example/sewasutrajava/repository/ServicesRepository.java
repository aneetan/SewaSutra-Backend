package com.example.demo.repository;

import com.example.demo.model.Services;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ServicesRepository extends JpaRepository<Services, Long> {
    List<Services> findByCompanyId(Long companyId);

    List<Services> findByServiceContainingIgnoreCase(String service);
}
