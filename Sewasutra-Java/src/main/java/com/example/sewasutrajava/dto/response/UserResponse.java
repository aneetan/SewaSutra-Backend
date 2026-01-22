package com.example.demo.dto.response;

import com.example.demo.enums.UserRole;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Response DTO for User entity.
 * Excludes sensitive information like password.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {

    private Long id;
    private String name;
    private String email;
    private String phone;
    private String address;
    private UserRole role;
    private Boolean emailVerified;
    private String profile;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Note: password is intentionally excluded from response
}
