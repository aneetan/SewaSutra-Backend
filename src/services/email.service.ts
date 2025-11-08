import { emailConfig, emailTransporter } from "../config/email.config";

class EmailService {
   async sendOTPEmail(email: string, otp: string, userName: string): Promise<void> {
      const subject = "Password reset OTP";

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
            <div class="header">
               <h1>Password Reset</h1>
            </div>
            <div class="content">
               <p>Hello ${userName},</p>
               <p>You requested to reset your password. Use the OTP below to proceed:</p>
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

      try{
         await emailTransporter.sendMail({
            from: emailConfig.from,
            to: email,
            subject,
            html
         });
      } catch(e) {
         throw new Error('Failed to send OTP email');
      }
   }
}

export default new EmailService();