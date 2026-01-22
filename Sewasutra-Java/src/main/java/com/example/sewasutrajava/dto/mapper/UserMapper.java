package com.example.demo.dto.mapper;

import com.example.demo.dto.request.UserRegistrationRequest;
import com.example.demo.dto.request.UserUpdateRequest;
import com.example.demo.dto.response.UserResponse;
import com.example.demo.model.User;
import org.modelmapper.ModelMapper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

/**
 * Mapper class for User entity and DTOs.
 * Uses ModelMapper for conversion.
 */
@Component
public class UserMapper {

    @Autowired
    private ModelMapper modelMapper;

    /**
     * Convert User entity to UserResponse DTO
     */
    public UserResponse toResponse(User user) {
        return modelMapper.map(user, UserResponse.class);
    }

    /**
     * Convert UserRegistrationRequest to User entity
     */
    public User toEntity(UserRegistrationRequest request) {
        return modelMapper.map(request, User.class);
    }

    /**
     * Update User entity from UserUpdateRequest
     */
    public void updateEntityFromRequest(User user, UserUpdateRequest request) {
        if (request.getName() != null) {
            user.setName(request.getName());
        }
        if (request.getPhone() != null) {
            user.setPhone(request.getPhone());
        }
        if (request.getAddress() != null) {
            user.setAddress(request.getAddress());
        }
        if (request.getProfile() != null) {
            user.setProfile(request.getProfile());
        }
    }
}
