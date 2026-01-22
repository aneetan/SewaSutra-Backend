import nodemailer from 'nodemailer'

export const emailTransporter = nodemailer.createTransport({
   service: 'Gmail',
   auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
   }
});

export const emailConfig = {
   from: process.env.EMAIL_FROM,
   appName: process.env.APP_NAME,
   appBaseUrl: process.env.FRONTEND_URL
}