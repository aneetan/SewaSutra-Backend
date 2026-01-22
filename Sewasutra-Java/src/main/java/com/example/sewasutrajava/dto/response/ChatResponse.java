package com.example.demo.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponse {
    private Long id;
    private String chatType;
    private String chatName;
    private String status;
    private LocalDateTime createdAt;
    private LocalDateTime lastMessageAt;
    private List<ParticipantInfo> participants;
    private MessageResponse lastMessage;
    private Long unreadCount;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ParticipantInfo {
        private Long userId;
        private String name;
        private String email;
    }
}
