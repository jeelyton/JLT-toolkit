import type { LoginResponse } from "$lib/apis/api";

export interface TokenInfo {
    access_token: string;
    refresh_token: string;
    expires_at: number;
}

export interface UserInfo {
    user_id: string;
    name: string;
}

// Reactive authentication state
let authState = $state({
    isAuthenticated: false,
    becomeUser: localStorage.becomeUser || '',
    tokenInfo: null as (TokenInfo | null),
    userInfo: null as UserInfo | null
});


export function isTokenExpired(): boolean {
    const access_token = authState.tokenInfo?.access_token;
    if(access_token && authState.tokenInfo!.expires_at < Date.now()) {
        return true
    }
    return false
}
export function getAccessToken(): string | null {
    const access_token = authState.tokenInfo?.access_token;
    if(!access_token) {
        throw new Error('未获取到登录信息！')
    }
    return access_token;
}
export function getRefreshToken(): string | undefined {
    return authState.tokenInfo?.refresh_token;
}

export function setTokens(loginRes: LoginResponse): void {
    const tokenInfo: TokenInfo = {
        access_token: loginRes.access_token,
        refresh_token: loginRes.refresh_token,
        expires_at: Date.now() + loginRes.expires_in * 1000 - 1000*60*5
    }
    console.log('token refreshed, expires_at', new Date(tokenInfo.expires_at).toLocaleString())
    localStorage.setItem('tokenInfo', JSON.stringify(tokenInfo));
    authState.tokenInfo = tokenInfo;

    authState.isAuthenticated = true;
}

export function removeTokens(): void {
    localStorage.removeItem('tokenInfo');
    localStorage.removeItem('user_info');

    authState.isAuthenticated = false;
    authState.userInfo = null;
    authState.tokenInfo = null;
}

export function setUserInfo(userInfo: UserInfo): void {
    localStorage.setItem('user_info', JSON.stringify(userInfo));
    authState.userInfo = userInfo;
}

// Export the reactive state for components that need it
export { authState };

function initTokenInfo() {
    const tokenInfo = localStorage.getItem('tokenInfo');
    return tokenInfo ? JSON.parse(tokenInfo) : null;
}
function initUserInfo(): UserInfo | null {
    const userInfo = localStorage.getItem('user_info');
    return userInfo ? JSON.parse(userInfo) : null;
}

// Initialize auth state
function initializeAuthState() {
    const tokenInfo = initTokenInfo();
    const userInfo = initUserInfo();

    if(tokenInfo) {
        authState.isAuthenticated = true;
        authState.userInfo = userInfo;
        authState.tokenInfo = tokenInfo;
        console.log('init token expires at', new Date(tokenInfo.expires_at).toLocaleString())
    }
}
initializeAuthState();