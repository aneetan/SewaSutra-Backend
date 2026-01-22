package com.example.demo.service;

import com.example.demo.dto.response.NotificationResponse;
import com.example.demo.enums.NotificationType;

import java.util.List;

public interface NotificationService {

    // Send notification
    void send(Long userId, String title, String message, NotificationType type, String actionUrl);

    // Send to multiple users
    void sendToMany(List<Long> userIds, String title, String message, NotificationType type);

    // Send with email
    void sendWithEmail(Long userId, String title, String message, NotificationType type, String actionUrl);

    List<NotificationResponse> getUserNotifications(Long userId);

    List<NotificationResponse> getUnreadNotifications(Long userId);

    Long getUnreadCount(Long userId);

    void markAsRead(Long notificationId, Long userId);

    void markAllAsRead(Long userId);

    void deleteNotification(Long notificationId, Long userId);

    // Cleanup old notifications (scheduled)
    void deleteOldNotifications(int daysOld);
}
