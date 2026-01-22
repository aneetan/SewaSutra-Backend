package com.example.demo.dto.mapper;

import com.example.demo.dto.request.CompanyRequest;
import com.example.demo.dto.response.CompanyResponse;
import com.example.demo.model.Company;
import com.example.demo.model.User;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class CompanyMapper {

    @Autowired
    private ModelMapper modelMapper;

    public CompanyResponse toResponse(Company company) {
        CompanyResponse response = modelMapper.map(company, CompanyResponse.class);
        if (company.getUser() != null) {
            response.setUserId(company.getUser().getId());
            response.setUserName(company.getUser().getName());
        }
        return response;
    }

    public Company toEntity(CompanyRequest request, User user) {
        Company company = modelMapper.map(request, Company.class);
        company.setUser(user);
        return company;
    }
}
