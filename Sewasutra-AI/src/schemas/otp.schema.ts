import z from "zod";

export const verifyOTPSchema = z.object({
   body: z.object({
      email: z.string().email('Invalid email address'),
      otp: z.string().length(6, 'OTP must be 6 digits'),
      token: z.string().optional(),
   })
})

export const resendOTPSchema = z.object({
   body: z.object({
      email: z.string().email('Invalid email address'),
      token: z.string().optional(), // Original token for verification
      purpose: z.enum(['email_verification', 'password_reset']).default('email_verification'),
  })
});

export type VerifyOTPInput = z.infer<typeof verifyOTPSchema>['body'];
export type ResendOTPInput = z.infer<typeof resendOTPSchema>['body'];
