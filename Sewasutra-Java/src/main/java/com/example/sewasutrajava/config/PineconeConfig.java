package com.example.demo.config;

import lombok.Getter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

/**
 * Pinecone configuration for AI vector database.
 * Used for storing and querying company/requirement embeddings.
 */
@Configuration
@Getter
public class PineconeConfig {

    @Value("${pinecone.api.key}")
    private String apiKey;

    @Value("${pinecone.environment}")
    private String environment;

    @Value("${pinecone.index.name}")
    private String indexName;

    @Value("${pinecone.dimension}")
    private int dimension;

    @Value("${app.ai.recommendation-limit}")
    private int recommendationLimit;

    @Value("${app.ai.recommendation-cache-ttl}")
    private int cacheTtl;

    @Value("${app.ai.similarity-threshold}")
    private double similarityThreshold;

    /**
     * Get Pinecone base URL
     */
    public String getBaseUrl() {
        return String.format("https://%s-%s.svc.%s.pinecone.io",
                indexName, "default", environment);
    }
}
