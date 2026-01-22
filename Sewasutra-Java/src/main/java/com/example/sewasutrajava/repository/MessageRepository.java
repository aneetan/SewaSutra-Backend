package com.example.demo.repository;

import com.example.demo.model.Message;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Repository for Message entity.
 * Handles chat messages with pagination and read status tracking.
 */
@Repository
public interface MessageRepository extends JpaRepository<Message, Long> {

    Page<Message> findByChatIdOrderByCreatedAtDesc(Long chatId, Pageable pageable);

    List<Message> findByChatIdOrderByCreatedAtAsc(Long chatId);

    @Query("SELECT COUNT(m) FROM Message m WHERE m.chat.id = :chatId AND m.status != 'READ' AND m.sender.id != :userId")
    Long countUnreadByChatIdAndUserId(@Param("chatId") Long chatId, @Param("userId") Long userId);

    @Query("SELECT COUNT(m) FROM Message m JOIN m.chat c JOIN c.participants p " +
            "WHERE p.id = :userId AND m.status != 'READ' AND m.sender.id != :userId")
    Long countTotalUnreadByUserId(@Param("userId") Long userId);

    @Query("SELECT m FROM Message m WHERE m.chat.id = :chatId ORDER BY m.createdAt DESC LIMIT 1")
    Message findLastMessageByChatId(@Param("chatId") Long chatId);
}
