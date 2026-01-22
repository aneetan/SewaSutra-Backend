package com.example.demo.service;

import com.example.demo.dto.request.ChatRequest;
import com.example.demo.dto.request.MessageRequest;
import com.example.demo.dto.response.ChatResponse;
import com.example.demo.dto.response.MessageResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface ChatService {

    ChatResponse createChat(ChatRequest request, Long userId);

    ChatResponse getChatById(Long chatId, Long userId);

    List<ChatResponse> getUserChats(Long userId);

    // Messages
    MessageResponse sendMessage(Long chatId, MessageRequest request, Long userId);

    Page<MessageResponse> getChatMessages(Long chatId, Long userId, Pageable pageable);

    void markMessageAsRead(Long messageId, Long userId);

    Long getUnreadCount(Long userId);

    void deleteMessage(Long messageId, Long userId);
}
