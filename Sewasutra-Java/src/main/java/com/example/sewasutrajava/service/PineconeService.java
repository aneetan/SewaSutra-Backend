package com.example.demo.service;

import java.util.List;
import java.util.Map;

public interface PineconeService {

    void upsertVector(String id, List<Double> vector, Map<String, Object> metadata);

    List<String> querySimilar(List<Double> vector, int topK, Map<String, Object> filter);

    void deleteVector(String id);
}
