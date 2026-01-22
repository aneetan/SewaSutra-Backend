package com.example.demo.enums;

/**
 * Status enum for Requirement entity.
 */
public enum RequirementStatus {
    OPEN, // Just posted, accepting quotes
    IN_PROGRESS, // Quote accepted, work in progress
    COMPLETED, // Work finished
    CANCELLED // Requirement cancelled by client
}
