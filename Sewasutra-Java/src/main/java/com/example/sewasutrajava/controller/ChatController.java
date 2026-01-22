package com.example.demo.controller;

import com.example.demo.dto.ApiResponse;
import com.example.demo.dto.request.ChatRequest;
import com.example.demo.dto.request.MessageRequest;
import com.example.demo.dto.response.ChatResponse;
import com.example.demo.dto.response.MessageResponse;
import com.example.demo.security.UserPrincipal;
import com.example.demo.service.ChatService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/chats")
public class ChatController {

    @Autowired
    private ChatService chatService;

    /**
     * Create a new chat (one-on-one)
     */
    @PostMapping
    public ResponseEntity<ApiResponse<ChatResponse>> createChat(
            @Valid @RequestBody ChatRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        ChatResponse response = chatService.createChat(request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(response, "Chat created"));
    }

    /**
     * Get chat by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<ChatResponse>> getChatById(
            @PathVariable Long id,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        ChatResponse response = chatService.getChatById(id, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(response, "Chat fetched"));
    }

    /**
     * Get my chats
     */
    @GetMapping("/my-chats")
    public ResponseEntity<ApiResponse<List<ChatResponse>>> getMyChats(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        List<ChatResponse> response = chatService.getUserChats(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(response, "Your chats fetched"));
    }

    /**
     * Send message to chat
     */
    @PostMapping("/{chatId}/messages")
    public ResponseEntity<ApiResponse<MessageResponse>> sendMessage(
            @PathVariable Long chatId,
            @Valid @RequestBody MessageRequest request,
            @AuthenticationPrincipal UserPrincipal currentUser) {

        MessageResponse response = chatService.sendMessage(chatId, request, currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(response, "Message sent"));
    }

    /**
     * Get chat messages (paginated)
     */
    @GetMapping("/{chatId}/messages")
    public ResponseEntity<ApiResponse<Page<MessageResponse>>> getChatMessages(
            @PathVariable Long chatId,
            @AuthenticationPrincipal UserPrincipal currentUser,
            Pageable pageable) {

        Page<MessageResponse> response = chatService.getChatMessages(chatId, currentUser.getId(), pageable);
        return ResponseEntity.ok(ApiResponse.success(response, "Messages fetched"));
    }

    /**
     * Get total unread message count
     */
    @GetMapping("/unread-count")
    public ResponseEntity<ApiResponse<Long>> getUnreadCount(
            @AuthenticationPrincipal UserPrincipal currentUser) {

        Long count = chatService.getUnreadCount(currentUser.getId());
        return ResponseEntity.ok(ApiResponse.success(count, "Unread count"));
    }
}
