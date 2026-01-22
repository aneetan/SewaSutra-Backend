package com.example.demo.service.impl;

import com.example.demo.service.EmbeddingService;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

/**
 * Mock implementation of AI Embedding service.
 * In production, this would call a model like 'all-MiniLM-L6-v2' via a local
 * library or API.
 */
@Service
public class EmbeddingServiceImpl implements EmbeddingService {

    @Override
    public List<Double> generateEmbedding(String text) {
        // Mock 384-dimensional vector (standard for MiniLM)
        List<Double> embedding = new ArrayList<>(384);
        Random random = new Random(text.hashCode()); // Deterministic for same text
        for (int i = 0; i < 384; i++) {
            embedding.add(random.nextDouble() * 2 - 1); // Values between -1 and 1
        }
        return embedding;
    }
}
