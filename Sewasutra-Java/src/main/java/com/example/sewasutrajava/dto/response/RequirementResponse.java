package com.example.demo.dto.response;

import com.example.demo.enums.RequirementStatus;
import com.example.demo.enums.UrgencyLevel;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RequirementResponse {
    private Long id;
    private String title;
    private String description;
    private String workType;
    private Integer minimumBudget;
    private Integer maximumBudget;
    private String category;
    private String timeline;
    private String skills;
    private String attachment;
    private UrgencyLevel urgency;
    private RequirementStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long userId;
    private String userName;
    private Integer quoteCount;
}
