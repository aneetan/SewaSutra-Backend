package com.example.demo.service.impl;

import com.example.demo.dto.request.ChatRequest;
import com.example.demo.dto.request.MessageRequest;
import com.example.demo.dto.response.ChatResponse;
import com.example.demo.dto.response.MessageResponse;
import com.example.demo.enums.ChatStatus;
import com.example.demo.enums.MessageStatus;
import com.example.demo.exception.BadRequestException;
import com.example.demo.exception.ResourceNotFoundException;
import com.example.demo.model.Chat;
import com.example.demo.model.Message;
import com.example.demo.model.User;
import com.example.demo.repository.ChatRepository;
import com.example.demo.repository.MessageRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.service.ChatService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ChatServiceImpl implements ChatService {

    @Autowired
    private ChatRepository chatRepository;

    @Autowired
    private MessageRepository messageRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired(required = false)
    private SimpMessagingTemplate messagingTemplate;

    @Override
    public ChatResponse createChat(ChatRequest request, Long userId) {
        User creator = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        User participant = userRepository.findById(request.getParticipantId())
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", request.getParticipantId()));

        if (userId.equals(request.getParticipantId())) {
            throw new BadRequestException("You cannot create a chat with yourself");
        }

        // Check if one-on-one chat already exists
        return chatRepository.findOneOnOneChatBetweenUsers(userId, request.getParticipantId())
                .map(this::mapToResponse)
                .orElseGet(() -> {
                    Chat chat = new Chat();
                    chat.setParticipants(new ArrayList<>(Arrays.asList(creator, participant)));
                    chat.setStatus(ChatStatus.ACTIVE);
                    chat.setChatType("ONE_ON_ONE");
                    chat.setCreatedAt(LocalDateTime.now());
                    chat.setLastMessageAt(LocalDateTime.now());

                    Chat saved = chatRepository.save(chat);
                    return mapToResponse(saved);
                });
    }

    @Override
    @Transactional(readOnly = true)
    public ChatResponse getChatById(Long chatId, Long userId) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new ResourceNotFoundException("Chat", "id", chatId));

        // Check if user is participant
        boolean isParticipant = chat.getParticipants().stream()
                .anyMatch(p -> p.getId().equals(userId));

        if (!isParticipant) {
            throw new BadRequestException("You are not a participant in this chat");
        }

        return mapToResponse(chat);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChatResponse> getUserChats(Long userId) {
        return chatRepository.findByParticipantId(userId).stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    public MessageResponse sendMessage(Long chatId, MessageRequest request, Long userId) {
        Chat chat = chatRepository.findById(chatId)
                .orElseThrow(() -> new ResourceNotFoundException("Chat", "id", chatId));

        User sender = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", userId));

        // Check if user is participant
        boolean isParticipant = chat.getParticipants().stream()
                .anyMatch(p -> p.getId().equals(userId));

        if (!isParticipant) {
            throw new BadRequestException("You are not a participant in this chat");
        }

        Message message = new Message();
        message.setChat(chat);
        message.setSender(sender);
        message.setContent(request.getContent());
        message.setMessageType(request.getMessageType() != null ? request.getMessageType() : "TEXT");
        message.setAttachments(request.getAttachments());
        message.setStatus(MessageStatus.SENT);
        message.setCreatedAt(LocalDateTime.now());

        Message saved = messageRepository.save(message);

        // Update chat last message timestamp
        chat.setLastMessageAt(LocalDateTime.now());
        chatRepository.save(chat);

        MessageResponse response = mapToMessageResponse(saved);

        // Send via WebSocket
        if (messagingTemplate != null) {
            for (User participant : chat.getParticipants()) {
                messagingTemplate.convertAndSendToUser(
                        participant.getEmail(),
                        "/queue/messages",
                        response);
            }
        }

        return response;
    }

    @Override
    @Transactional(readOnly = true)
    public Page<MessageResponse> getChatMessages(Long chatId, Long userId, Pageable pageable) {
        // Verification of participant moved to controller or redundant here if desired
        return messageRepository.findByChatIdOrderByCreatedAtDesc(chatId, pageable)
                .map(this::mapToMessageResponse);
    }

    @Override
    public void markMessageAsRead(Long messageId, Long userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message", "id", messageId));

        if (!message.getSender().getId().equals(userId)) {
            message.setStatus(MessageStatus.READ);
            message.setReadBy("user:" + userId);
            messageRepository.save(message);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Long getUnreadCount(Long userId) {
        return messageRepository.countTotalUnreadByUserId(userId);
    }

    @Override
    public void deleteMessage(Long messageId, Long userId) {
        Message message = messageRepository.findById(messageId)
                .orElseThrow(() -> new ResourceNotFoundException("Message", "id", messageId));

        if (!message.getSender().getId().equals(userId)) {
            throw new BadRequestException("You can only delete your own messages");
        }

        messageRepository.delete(message);
    }

    private ChatResponse mapToResponse(Chat chat) {
        ChatResponse response = new ChatResponse();
        response.setId(chat.getId());
        response.setStatus(chat.getStatus().name());
        response.setChatType(chat.getChatType());
        response.setChatName(chat.getName());
        response.setCreatedAt(chat.getCreatedAt());
        response.setLastMessageAt(chat.getLastMessageAt());

        List<ChatResponse.ParticipantInfo> participants = chat.getParticipants().stream()
                .map(p -> new ChatResponse.ParticipantInfo(p.getId(), p.getName(), p.getEmail()))
                .collect(Collectors.toList());
        response.setParticipants(participants);

        Message lastMessage = messageRepository.findLastMessageByChatId(chat.getId());
        if (lastMessage != null) {
            response.setLastMessage(mapToMessageResponse(lastMessage));
        }

        return response;
    }

    private MessageResponse mapToMessageResponse(Message message) {
        MessageResponse response = new MessageResponse();
        response.setId(message.getId());
        response.setChatId(message.getChat().getId());
        response.setSenderId(message.getSender().getId());
        response.setSenderName(message.getSender().getName());
        response.setContent(message.getContent());
        response.setMessageType(message.getMessageType());
        response.setAttachments(message.getAttachments());
        response.setStatus(message.getStatus().name());
        response.setCreatedAt(message.getCreatedAt());
        return response;
    }
}
