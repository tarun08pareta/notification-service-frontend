export interface User {
    id: string;
    name: string;
    email: string;
    roles: string[];
    status: string;
    authProvider: string;
}

export interface LoginResponse {
    accessToken: string;
    tokenType: string;
    expiresIn: number;
    user: User;
}

export interface LoginRequest {
    email: string;
    password?: string; // Optional because we might not want to log it easily
}

export interface SignupRequest {
    name: string;
    email: string;
    password?: string;
}
