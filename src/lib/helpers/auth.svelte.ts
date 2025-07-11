import type { LoginResponse } from "$lib/apis/api";

// Reactive authentication state
let authState = $state({
    isAuthenticated: false,
    userInfo: null as { id: string; username: string; name: string } | null
});


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

    authState.isAuthenticated = true;
}

export function removeTokens(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    // localStorage.removeItem('user_info');

    authState.isAuthenticated = false;
    authState.userInfo = null;
}

export function getUserInfo(): { id: string; username: string; name: string } | null {
    const userInfo = localStorage.getItem('user_info');
    return userInfo ? JSON.parse(userInfo) : null;
}

export function setUserInfo(userInfo: { id: string; username: string; name: string }): void {
    localStorage.setItem('user_info', JSON.stringify(userInfo));
    authState.userInfo = userInfo;
}

// Export the reactive state for components that need it
export { authState };

// Initialize auth state
function initializeAuthState() {
    const token = getAccessToken();
    const userInfo = getUserInfo();

    if(token && userInfo) {
        authState.isAuthenticated = true;
        authState.userInfo = userInfo;
    }
}
initializeAuthState();