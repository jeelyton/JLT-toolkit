import { stat, writeFile } from "@tauri-apps/plugin-fs";
import { desktopDir } from "@tauri-apps/api/path";
import { upload, download } from "@tauri-apps/plugin-upload";
import type { XFile } from "$lib/components/FileItem.svelte";
import { authState, getAccessToken, getRefreshToken, isTokenExpired, removeTokens, setTokens, setUserInfo } from "$lib/helpers/auth.svelte";
import { fetch } from "@tauri-apps/plugin-http";
import { toast } from "svelte-sonner";

export const IS_DEV = !import.meta.env.VITE_FLOW_API_URL
export const FLOW_API_URL = localStorage.apiUrl || import.meta.env.VITE_FLOW_API_URL || "http://127.0.0.1:8601"
console.log('FLOW_API_URL', FLOW_API_URL)


export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

export async function loginUser(credentials: LoginCredentials): Promise<LoginResponse> {
  const res = await fetch(`${FLOW_API_URL}/users/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  });

  if (!res.ok) {
    const errDetail = await res.json().catch(() => ({}))
    const err = new Error(`程序异常：${res.status}`)
    if(typeof errDetail.detail === 'string') {
      err.message = `${res.status}: ${errDetail.detail}`
    }
    throw err
  }

  const data = await res.json();
  setTokens(data)
  const userInfo = await getUserInfo()
  console.log('loginUser', data, userInfo)
  setUserInfo(userInfo)
  return data;
}
function handle401() {
  toast.error('登录信息已过期，请重新登录！')
  removeTokens()
}
async function refreshToken(): Promise<LoginResponse> {
  const res = await fetch(`${FLOW_API_URL}/users/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({refresh_token: getRefreshToken()})
  });

  if (!res.ok) {
    handle401()
    const err = await res.json().catch(() => ({}))
    console.error('refreshToken', err)
    throw err
  }

  const data = await res.json();
  return data;
}

export async function fetchWithToken(url: string, options: RequestInit) {
  if(isTokenExpired()) {
    const loginRes = await refreshToken();
    setTokens(loginRes);
  }
  const access_token = getAccessToken()
  url = url.startsWith('http') ? url : FLOW_API_URL + url;
  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${access_token}`,
      ...(authState.becomeUser ? {'x-become': authState.becomeUser} : {})
    }
  })
  if(!res.ok) {
    if(res.status === 401) {
      handle401()
    }
    const errDetail = await res.json().catch(() => ({}))
    const err = new Error(`程序异常：${res.status}`)
    if(typeof errDetail.detail === 'string') {
      err.message = `${res.status}: ${errDetail.detail}`
    } else if(errDetail.detail) {
      err.detail = errDetail.detail
    }
    throw err
  }
  return res;
}
async function getUserInfo() {
  const res = await fetchWithToken('/users/me', {
    method: 'GET'
  })
  return await res.json()
}


export async function uploadFile(file: XFile, onProgress?: (progress: number) => void) {
    const fileStat = await stat(file.filePath)
    const fileSize = fileStat.size
    const res  = await upload(FLOW_API_URL + '/files/', file.filePath, ({progress, progressTotal, total}) => {
      onProgress?.(Math.floor((progressTotal/fileSize) * 100))
    }, {
      'FileName': encodeURIComponent(file.fileName),
    })
    return JSON.parse(res)
}

export async function downloadFile(url: string, filePath: string, onProgress?: (progress: number) => void) {
  await download(url, filePath, ({progress, progressTotal, total}) => {
    // onProgress?.(Math.floor((progressTotal/total) * 100))
  })
}


function getFileName(contentDisposition: string) {
  // content-disposition: attachment; filename*=utf-8''%E8%BD%AC%E6%8D%A220250613095908.xlsx
  const fileName = decodeURIComponent(contentDisposition.split(/filename\*?=(?:utf-8''|")?/)[1].replace(/"$/, ''))
  return fileName
}

export async function executeWorkflow(workflowAPI: string, fileInfo: any) {
  const res = await fetchWithToken(workflowAPI, {
    method: 'POST',
    body: JSON.stringify(fileInfo)
  })
  if(res.headers.get('content-type') === 'application/json') {
    return await res.json()
  }
  const desktopPath = await desktopDir()
  const fileName = getFileName(res.headers.get('content-disposition') || '')
  const filePath = `${desktopPath}/${fileName}`
  const responseData = await res.arrayBuffer()
  await writeFile(filePath, new Uint8Array(responseData))
  return {type: 'file', filePath, fileName}
}
