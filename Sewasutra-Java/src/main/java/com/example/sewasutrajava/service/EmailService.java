package com.example.demo.service;

/**
 * Email service for sending notifications
 */
public interface EmailService {

    void sendVerificationEmail(String to, String verificationToken);

    void sendPasswordResetEmail(String to, String resetToken);

    void sendQuoteReceivedEmail(String to, String clientName, String requirementTitle, String companyName);

    void sendQuoteAcceptedEmail(String to, String companyName, String requirementTitle);

    void sendContractSignedEmail(String to, String otherPartyName, String projectTitle);

    void sendPaymentConfirmationEmail(String to, Double amount, String transactionId);

    void sendCompanyApprovedEmail(String to, String companyName);

    void sendCompanyDeclinedEmail(String to, String companyName, String reason);

    void sendGenericEmail(String to, String subject, String body);
}
