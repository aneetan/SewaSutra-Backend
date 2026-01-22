package com.example.demo.service.impl;

import com.example.demo.service.PineconeService;
import com.google.gson.Gson;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Service
public class PineconeServiceImpl implements PineconeService {

    private final OkHttpClient client = new OkHttpClient();
    private final Gson gson = new Gson();

    @Value("${pinecone.api-key:PLACEHOLDER}")
    private String apiKey;

    @Value("${pinecone.environment:PLACEHOLDER}")
    private String environment;

    @Value("${pinecone.index-name:PLACEHOLDER}")
    private String indexName;

    @Value("${pinecone.base-url:https://PLACEHOLDER.svc.pinecone.io}")
    private String baseUrl;

    @Override
    public void upsertVector(String id, List<Double> vector, Map<String, Object> metadata) {
        Map<String, Object> payload = new HashMap<>();
        Map<String, Object> vectorData = new HashMap<>();
        vectorData.put("id", id);
        vectorData.put("values", vector);
        vectorData.put("metadata", metadata);

        List<Map<String, Object>> vectors = new ArrayList<>();
        vectors.add(vectorData);
        payload.put("vectors", vectors);

        sendRequest("/vectors/upsert", payload);
    }

    @Override
    public List<String> querySimilar(List<Double> vector, int topK, Map<String, Object> filter) {
        Map<String, Object> payload = new HashMap<>();
        payload.put("vector", vector);
        payload.put("topK", topK);
        payload.put("includeMetadata", true);
        if (filter != null) {
            payload.put("filter", filter);
        }

        String response = sendRequest("/query", payload);
        // Parse response to get IDs (simplified for brevity)
        // In reality, would use Gson to parse matches and extract IDs
        return new ArrayList<>();
    }

    @Override
    public void deleteVector(String id) {
        Map<String, Object> payload = new HashMap<>();
        List<String> ids = new ArrayList<>();
        ids.add(id);
        payload.put("ids", ids);

        sendRequest("/vectors/delete", payload);
    }

    private String sendRequest(String endpoint, Object payload) {
        String json = gson.toJson(payload);
        RequestBody body = RequestBody.create(json, MediaType.parse("application/json"));

        Request request = new Request.Builder()
                .url(baseUrl + endpoint)
                .addHeader("Api-Key", apiKey)
                .post(body)
                .build();

        try (Response response = client.newCall(request).execute()) {
            if (!response.isSuccessful()) {
                // Log error but don't fail for the demo
                System.err.println("Pinecone request failed: " + response.code());
                return null;
            }
            return response.body() != null ? response.body().string() : null;
        } catch (IOException e) {
            System.err.println("Pinecone connection error: " + e.getMessage());
            return null;
        }
    }
}
