import { z } from "zod";

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/; 
  return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, '')); 
};

const validatePassword = (password: string): boolean => {
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
  return passwordRegex.test(password);
};

// Zod Schema
export const registerUserSchema = z.object({
  body: z.object({
    name: z.string()
      .min(1, "Full name is required")
      .min(2, "Name must be at least 2 characters long")
      .trim(),
    
    email: z.string()
      .min(1, "Email address is required")
      .email("Please enter a valid email address")
      .refine(validateEmail, "Please enter a valid email address")
      .trim(),
    
    phone: z.string()
      .min(1, "Phone number is required")
      .refine(validatePhone, "Please enter a valid phone number")
      .trim(),
    
    address: z.string()
      .min(1, "Address is required")
      .min(5, "Please enter a complete address")
      .trim(),
    
    role: z.enum(['CLIENT', 'COMPANY', 'ADMIN']),
    status: z.enum(["VERIFIED", "PENDING","DECLINED"]),
    
    password: z.string()
      .min(1, "Password is required")
      .min(8, "Password must be at least 8 characters")
      .refine(validatePassword, "Password must contain at least one uppercase letter, one lowercase letter, and one number"),
    
    confirmPassword: z.string()
      .min(1, "Please confirm your password")
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"]
  })
});

export const loginUserSchema = z.object({
   body: z.object({
      email: z.string()
         .email("Invalid email address"),
      password: z.string()
         .min(8, "Password must be at least 8 characters")
         .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
         .regex(/[a-z]/, "Password must contain at least one lowercase letter")
         .regex(/[0-9]/, "Password must contain at least one number")
   })
})

export const updateUserData = z.object({
   body: registerUserSchema.shape.body.partial()
}) 

// Type inference 
export type RegisterUserInput = z.infer<typeof registerUserSchema>["body"];
export type LoginUserInput = z.infer<typeof loginUserSchema>["body"];
export type UpdateUserInput = z.infer<typeof updateUserData>["body"];

