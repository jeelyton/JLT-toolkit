import type { LoginResponse } from "$lib/apis/api";

// Authentication utilities
export function getAccessToken(): string | null {
    return localStorage.getItem('access_token');
}
export function getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
}

export function setTokens(token: LoginResponse): void {
    localStorage.setItem('access_token', token.access_token);
    localStorage.setItem('refresh_token', token.refresh_token);
}

export function removeAuthToken(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
}

export function getUserInfo(): { id: string; username: string; name: string } | null {
    const userInfo = localStorage.getItem('user_info');
    return userInfo ? JSON.parse(userInfo) : null;
}

export function isAuthenticated(): boolean {
    return !!getAccessToken();
}
  