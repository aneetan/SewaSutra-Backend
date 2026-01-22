package com.example.demo.repository;

import com.example.demo.enums.UserRole;
import com.example.demo.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository interface for User entity.
 * Provides CRUD operations and custom query methods.
 */
@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * Find user by email (unique identifier)
     */
    Optional<User> findByEmail(String email);

    /**
     * Find all users by role
     */
    List<User> findByRole(UserRole role);

    /**
     * Check if user exists by email
     */
    Boolean existsByEmail(String email);

    /**
     * Find users by email verification status
     */
    List<User> findByEmailVerified(Boolean emailVerified);

    /**
     * Find users by name containing (case-insensitive search)
     */
    List<User> findByNameContainingIgnoreCase(String name);
}
