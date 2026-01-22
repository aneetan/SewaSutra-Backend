package com.example.demo.dto.request;

import com.example.demo.enums.UrgencyLevel;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RequirementRequest {

    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 200, message = "Title must be between 5 and 200 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 50, max = 5000, message = "Description must be between 50 and 5000 characters")
    private String description;

    private String workType; // FIXED, HOURLY, MILESTONE

    @Min(value = 1000, message = "Minimum budget must be at least NPR 1000")
    private Integer minimumBudget;

    @Min(value = 1000, message = "Maximum budget must be at least NPR 1000")
    private Integer maximumBudget;

    @NotBlank(message = "Category is required")
    private String category; // IT, MEP

    private String timeline;

    private String skills; // Comma-separated

    private String attachment;

    private UrgencyLevel urgency;
}
