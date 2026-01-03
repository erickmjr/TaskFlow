interface ResetPasswordTokenPayload {
    sub: string;
    email: string;
    purpose: 'password-reset';
}