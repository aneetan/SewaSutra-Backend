package com.example.demo.dto.request;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class MessageRequest {

    @NotBlank(message = "Content is required")
    @Size(max = 5000, message = "Message cannot exceed 5000 characters")
    private String content;

    private String messageType; // TEXT, FILE, IMAGE, DOCUMENT

    private String attachments; // JSON array of file URLs
}
