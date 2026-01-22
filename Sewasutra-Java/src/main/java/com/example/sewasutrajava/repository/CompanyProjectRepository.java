package com.example.demo.repository;

import com.example.demo.model.CompanyProject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompanyProjectRepository extends JpaRepository<CompanyProject, Long> {
    List<CompanyProject> findByCompanyId(Long companyId);

    List<CompanyProject> findByCategory(String category);
}
