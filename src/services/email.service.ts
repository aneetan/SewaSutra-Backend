import { emailConfig, emailTransporter } from "../config/email.config";

class EmailService {

  async sendOTPEmail(email: string, otp: string, userName: string): Promise<void> {
    const subject = "Password Reset OTP";

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #007bff; color: white; padding: 20px; text-align: center; }
        .content { background: #f9f9f9; padding: 30px; border-radius: 5px; }
        .otp { font-size: 32px; font-weight: bold; color: #007bff; text-align: center; margin: 20px 0; }
        .footer { text-align: center; margin-top: 30px; color: #666; font-size: 12px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header"><h1>Password Reset</h1></div>
        <div class="content">
          <p>Hello ${userName},</p>
          <p>You requested to reset your password. Use the OTP below:</p>
          <div class="otp">${otp}</div>
          <p>This OTP will expire in 2 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} ${emailConfig.appName}. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
    `;

    await this.sendMail(email, subject, html);
  }

  // ✅ Company Approved Mail
  async sendCompanyApprovedEmail(email: string, companyName: string): Promise<void> {
    const subject = "Your Company Has Been Approved 🎉";

    const html = `
    <div style="font-family: Arial; max-width:600px; margin:auto;">
      <h2 style="color:#28a745;">Company Approved</h2>
      <p>Dear ${companyName},</p>
      <p>Congratulations! Your company profile has been successfully approved by our admin team.</p>
      <p>You can now access all features and start receiving projects.</p>
      <br/>
      <p>Best regards,<br/>${emailConfig.appName} Team</p>
    </div>
    `;

    await this.sendMail(email, subject, html);
  }

  // ❌ Company Declined Mail
  async sendCompanyDeclinedEmail(email: string, companyName: string, reason?: string): Promise<void> {
    const subject = "Company Verification Declined";

    const html = `
    <div style="font-family: Arial; max-width:600px; margin:auto;">
      <h2 style="color:#dc3545;">Company Verification Declined</h2>
      <p>Dear ${companyName},</p>
      <p>Unfortunately, your company verification request has been declined.</p>
      ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ""}
      <p>You may update your details and apply again.</p>
      <br/>
      <p>Best regards,<br/>${emailConfig.appName} Team</p>
    </div>
    `;

    await this.sendMail(email, subject, html);
  }

  // 🔐 Password Changed Mail
  async sendPasswordChangedEmail(email: string, userName: string): Promise<void> {
    const subject = "Your Password Has Been Changed";

    const html = `
    <div style="font-family: Arial; max-width:600px; margin:auto;">
      <h2 style="color:#ffc107;">Password Changed</h2>
      <p>Hello ${userName},</p>
      <p>Your password was successfully changed.</p>
      <p>If this was not you, please contact support immediately.</p>
      <br/>
      <p>Best regards,<br/>${emailConfig.appName} Team</p>
    </div>
    `;

    await this.sendMail(email, subject, html);
  }

  // 🔁 Common mail sender
  private async sendMail(to: string, subject: string, html: string): Promise<void> {
    try {
      await emailTransporter.sendMail({
        from: emailConfig.from,
        to,
        subject,
        html,
      });
    } catch (e) {
      throw new Error("Failed to send email");
    }
  }
}

export default new EmailService();
