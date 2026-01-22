package com.example.demo.controller;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.request.UserLoginRequest;
import com.example.demo.dto.request.UserRegistrationRequest;
import com.example.demo.dto.request.UserUpdateRequest;
import com.example.demo.dto.response.LoginResponse;
import com.example.demo.dto.response.UserResponse;
import com.example.demo.security.UserPrincipal;
import com.example.demo.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST Controller for User entity.
 * Handles HTTP requests for user management and authentication.
 */
@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    /**
     * POST /users/register - Register a new user
     * Public endpoint
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<UserResponse>> register(
            @Valid @RequestBody UserRegistrationRequest request) {
        UserResponse user = userService.register(request);
        ApiResponse<UserResponse> response = ApiResponse.success(user, "User registered successfully");
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    /**
     * POST /users/login - Authenticate user and get JWT token
     * Public endpoint
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<LoginResponse>> login(
            @Valid @RequestBody UserLoginRequest request) {
        LoginResponse loginResponse = userService.login(request);
        ApiResponse<LoginResponse> response = ApiResponse.success(loginResponse, "Login successful");
        return ResponseEntity.ok(response);
    }

    /**
     * POST /users/verify-email - Verify user email
     * Public endpoint (in production, this should use a verification token)
     */
    @PostMapping("/verify-email")
    public ResponseEntity<ApiResponse<UserResponse>> verifyEmail(@RequestParam String email) {
        UserResponse user = userService.verifyEmail(email);
        ApiResponse<UserResponse> response = ApiResponse.success(user, "Email verified successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * GET /users/me - Get current authenticated user's profile
     * Requires authentication
     */
    @GetMapping("/me")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser(
            @AuthenticationPrincipal UserPrincipal currentUser) {
        UserResponse user = userService.getUserById(currentUser.getId());
        ApiResponse<UserResponse> response = ApiResponse.success(user, "User fetched successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * GET /users/{id} - Get user by ID
     * Requires authentication
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> getUserById(@PathVariable Long id) {
        UserResponse user = userService.getUserById(id);
        ApiResponse<UserResponse> response = ApiResponse.success(user, "User fetched successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * GET /users - Get all users with pagination
     * Admin only
     */
    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Page<UserResponse>>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDirection) {

        Sort.Direction direction = sortDirection.equalsIgnoreCase("ASC") ? Sort.Direction.ASC : Sort.Direction.DESC;
        Pageable pageable = PageRequest.of(page, size, Sort.by(direction, sortBy));

        Page<UserResponse> users = userService.getAllUsers(pageable);
        ApiResponse<Page<UserResponse>> response = ApiResponse.success(users, "Users fetched successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /users/{id} - Update user profile
     * Requires authentication (can only update own profile unless admin)
     */
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(
            @PathVariable Long id,
            @Valid @RequestBody UserUpdateRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        // Check if user is updating their own profile or is admin
        if (!currentUser.getId().equals(id) &&
                !currentUser.getRole().name().equals("ADMIN")) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(ApiResponse.error("You can only update your own profile"));
        }

        UserResponse user = userService.updateUser(id, request);
        ApiResponse<UserResponse> response = ApiResponse.success(user, "User updated successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * DELETE /users/{id} - Delete user
     * Admin only
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        ApiResponse<Void> response = ApiResponse.success("User deleted successfully");
        return ResponseEntity.ok(response);
    }

    /**
     * GET /users/search - Search users by name
     * Requires authentication
     */
    @GetMapping("/search")
    public ResponseEntity<ApiResponse<List<UserResponse>>> searchUsers(@RequestParam String name) {
        List<UserResponse> users = userService.searchUsersByName(name);
        ApiResponse<List<UserResponse>> response = ApiResponse.success(users, "Search completed successfully");
        return ResponseEntity.ok(response);
    }
}
