import z from "zod";

export const verifyOTPSchema = z.object({
   body: z.object({
      email: z.string().email('Invalid email address'),
      otp: z.string().length(6, 'OTP must be 6 digits'),
      token: z.string().optional(),
   })
})

export type VerifyOTPInput = z.infer<typeof verifyOTPSchema>['body'];