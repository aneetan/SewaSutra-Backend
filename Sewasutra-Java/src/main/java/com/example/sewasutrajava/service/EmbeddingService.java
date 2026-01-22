package com.example.demo.service;

import java.util.List;

public interface EmbeddingService {

    List<Double> generateEmbedding(String text);
}
