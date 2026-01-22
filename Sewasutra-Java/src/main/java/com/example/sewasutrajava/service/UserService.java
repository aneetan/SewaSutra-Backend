package com.example.demo.service;

import com.example.demo.dto.request.UserLoginRequest;
import com.example.demo.dto.request.UserRegistrationRequest;
import com.example.demo.dto.request.UserUpdateRequest;
import com.example.demo.dto.response.LoginResponse;
import com.example.demo.dto.response.UserResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

/**
 * Service interface for User entity operations.
 */
public interface UserService {

    /**
     * Register a new user
     */
    UserResponse register(UserRegistrationRequest request);

    /**
     * Authenticate user and generate JWT token
     */
    LoginResponse login(UserLoginRequest request);

    /**
     * Verify user email
     */
    UserResponse verifyEmail(String email);

    /**
     * Get user by ID
     */
    UserResponse getUserById(Long id);

    /**
     * Get user by email
     */
    UserResponse getUserByEmail(String email);

    /**
     * Get all users with pagination
     */
    Page<UserResponse> getAllUsers(Pageable pageable);

    /**
     * Update user profile
     */
    UserResponse updateUser(Long id, UserUpdateRequest request);

    /**
     * Delete user
     */
    void deleteUser(Long id);

    /**
     * Search users by name
     */
    List<UserResponse> searchUsersByName(String name);
}
