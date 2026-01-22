package com.example.demo.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * File storage configuration.
 * Handles file uploads for attachments, documents, images.
 */
@Configuration
@Getter
public class FileStorageConfig {

    @Value("${file.upload.dir}")
    private String uploadDir;

    @Value("${file.upload.allowed-extensions}")
    private String[] allowedExtensions;

    @Value("${spring.servlet.multipart.max-file-size}")
    private String maxFileSize;

    /**
     * Get upload directory path
     */
    public String getUploadDirectory() {
        return uploadDir;
    }

    /**
     * Check if file extension is allowed
     */
    public boolean isAllowedExtension(String extension) {
        if (extension == null || allowedExtensions == null) {
            return false;
        }

        String lowerExt = extension.toLowerCase();
        for (String allowed : allowedExtensions) {
            if (allowed.equalsIgnoreCase(lowerExt)) {
                return true;
            }
        }
        return false;
    }
}
