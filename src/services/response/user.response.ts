import { UserI } from "../../models/user.model";

export interface EmailSignUpI {
    token: string
    user: UserI
}

export interface EmailSignInI {
    user: UserI
    token: string
}

export interface ForgetPasswordI {
    message: string
}

export interface ChangePasswordI {
    message: string
}

export interface VerifyEmailI {
    message: string
}

export interface ResendVerifyEmailI {
    message: string
}

export interface ResetPasswordI {
    message: string
}