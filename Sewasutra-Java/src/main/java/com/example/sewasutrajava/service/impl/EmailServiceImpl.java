package com.example.demo.service.impl;

import com.example.demo.service.EmailService;
import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Service
public class EmailServiceImpl implements EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailServiceImpl.class);

    @Autowired(required = false)
    private JavaMailSender mailSender;

    @Value("${app.email.from:no-reply@sewasutra.com}")
    private String fromEmail;

    @Value("${app.email.from-name:SewaSutra Platform}")
    private String fromName;

    @Override
    @Async
    public void sendVerificationEmail(String to, String verificationToken) {
        String subject = "Verify Your Email - SewaSutra";
        String body = String.format("""
                <h2>Welcome to SewaSutra!</h2>
                <p>Please verify your email by clicking the link below:</p>
                <a href="http://localhost:8080/api/auth/verify-email?token=%s">Verify Email</a>
                <p>This link expires in 24 hours.</p>
                """, verificationToken);
        sendHtmlEmail(to, subject, body);
    }

    @Override
    @Async
    public void sendPasswordResetEmail(String to, String resetToken) {
        String subject = "Reset Your Password - SewaSutra";
        String body = String.format("""
                <h2>Password Reset Request</h2>
                <p>Click the link below to reset your password:</p>
                <a href="http://localhost:3000/reset-password?token=%s">Reset Password</a>
                <p>This link expires in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
                """, resetToken);
        sendHtmlEmail(to, subject, body);
    }

    @Override
    @Async
    public void sendQuoteReceivedEmail(String to, String clientName, String requirementTitle, String companyName) {
        String subject = "New Quote Received - " + requirementTitle;
        String body = String.format("""
                <h2>New Quote Received!</h2>
                <p>Dear %s,</p>
                <p>You have received a new quote from <strong>%s</strong> for your requirement:</p>
                <p><strong>%s</strong></p>
                <p><a href="http://localhost:3000/quotes">View Quote</a></p>
                """, clientName, companyName, requirementTitle);
        sendHtmlEmail(to, subject, body);
    }

    @Override
    @Async
    public void sendQuoteAcceptedEmail(String to, String companyName, String requirementTitle) {
        String subject = "Your Quote was Accepted! - SewaSutra";
        String body = String.format("""
                <h2>Congratulations!</h2>
                <p>Dear %s Team,</p>
                <p>Your quote for <strong>%s</strong> has been accepted!</p>
                <p>A contract has been created. Please sign it to proceed.</p>
                <p><a href="http://localhost:3000/contracts">View Contract</a></p>
                """, companyName, requirementTitle);
        sendHtmlEmail(to, subject, body);
    }

    @Override
    @Async
    public void sendContractSignedEmail(String to, String otherPartyName, String projectTitle) {
        String subject = "Contract Signed - " + projectTitle;
        String body = String.format("""
                <h2>Contract is Now Active!</h2>
                <p>Both parties have signed the contract for <strong>%s</strong>.</p>
                <p>You can now proceed with the project.</p>
                <p><a href="http://localhost:3000/contracts">View Contract</a></p>
                """, projectTitle);
        sendHtmlEmail(to, subject, body);
    }

    @Override
    @Async
    public void sendPaymentConfirmationEmail(String to, Double amount, String transactionId) {
        String subject = "Payment Confirmation - SewaSutra";
        String body = String.format("""
                <h2>Payment Successful!</h2>
                <p>Your payment has been processed successfully.</p>
                <table>
                    <tr><td><strong>Amount:</strong></td><td>NPR %,.2f</td></tr>
                    <tr><td><strong>Transaction ID:</strong></td><td>%s</td></tr>
                </table>
                <p><a href="http://localhost:3000/payments">View Payment History</a></p>
                """, amount, transactionId);
        sendHtmlEmail(to, subject, body);
    }

    @Override
    @Async
    public void sendCompanyApprovedEmail(String to, String companyName) {
        String subject = "Company Approved - Welcome to SewaSutra!";
        String body = String.format("""
                <h2>Congratulations!</h2>
                <p>Your company <strong>%s</strong> has been verified and approved.</p>
                <p>You can now:</p>
                <ul>
                    <li>Receive quote requests from clients</li>
                    <li>Submit quotes for requirements</li>
                    <li>Get matched with clients via our AI recommendation system</li>
                </ul>
                <p><a href="http://localhost:3000/dashboard">Go to Dashboard</a></p>
                """, companyName);
        sendHtmlEmail(to, subject, body);
    }

    @Override
    @Async
    public void sendCompanyDeclinedEmail(String to, String companyName, String reason) {
        String subject = "Company Verification Update - SewaSutra";
        String body = String.format("""
                <h2>Verification Update</h2>
                <p>Unfortunately, your company <strong>%s</strong> could not be verified at this time.</p>
                <p><strong>Reason:</strong> %s</p>
                <p>You may reapply after 30 days with updated documentation.</p>
                <p>If you have questions, please contact support.</p>
                """, companyName, reason);
        sendHtmlEmail(to, subject, body);
    }

    @Override
    @Async
    public void sendGenericEmail(String to, String subject, String body) {
        String htmlBody = String.format("""
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2>%s</h2>
                    <p>%s</p>
                    <hr>
                    <p style="color: #666; font-size: 12px;">
                        This is an automated message from SewaSutra Platform.
                    </p>
                </div>
                """, subject, body);
        sendHtmlEmail(to, subject, htmlBody);
    }

    private void sendHtmlEmail(String to, String subject, String htmlBody) {
        if (mailSender == null) {
            log.warn("Mail sender not configured. Email not sent to: {}", to);
            return;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, fromName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);

            mailSender.send(message);
            log.info("Email sent to: {}", to);
        } catch (MessagingException e) {
            log.error("Failed to send email to: {}", to, e);
        } catch (Exception e) {
            log.error("Email sending error: {}", e.getMessage());
        }
    }
}
