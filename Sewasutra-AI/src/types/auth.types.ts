export interface UserAttributes {
    id: number;
    name: string;
    email: string;
    phone: string;
    address: string;
    role: "CLIENT" | "COMPANY" | "ADMIN";
    password: string;
    status?: "VERIFIED" | "PENDING" | "DECLINED";
    emailVerified?: boolean;
}

export interface UserRegisterDto {
   name: string;
   email: string;
   phone: string;
   address: string;
   role: "CLIENT" | "COMPANY" | "ADMIN";
   password: string;
   confirmPassword: string;
   status?: "VERIFIED" | "PENDING" | "DECLINED";

}

export interface UserLoginDto {
    email: string;
    password: string;
}

export interface OTPVerifyData{
    token: string;
    email: string;
    otp: string;
}