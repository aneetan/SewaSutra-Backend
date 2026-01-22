package com.example.demo.service;

import org.springframework.web.multipart.MultipartFile;
import org.springframework.core.io.Resource;
import java.nio.file.Path;

public interface FileStorageService {

    String storeFile(MultipartFile file, String subDir);

    Resource loadFileAsResource(String fileName, String subDir);

    void deleteFile(String fileName, String subDir);

    Path getFilePath(String fileName, String subDir);

    String getFileUrl(String fileName, String subDir);
}
