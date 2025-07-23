import { stat, writeFile } from "@tauri-apps/plugin-fs";
import { desktopDir } from "@tauri-apps/api/path";
import { upload, download } from "@tauri-apps/plugin-upload";
import type { XFile } from "$lib/components/FileItem.svelte";
import { getAccessToken } from "$lib/helpers/auth.svelte";
import { fetch } from "@tauri-apps/plugin-http";

export const IS_DEV = !import.meta.env.VITE_FLOW_API_URL
export  const FLOW_API_URL = import.meta.env.VITE_FLOW_API_URL || "http://127.0.0.1:8601"
export  const PLAY_API_URL = import.meta.env.VITE_PLAY_API_URL || "http://127.0.0.1:8602"
export const N8N_API_URL = 'https://n8n.17ch.cn/webhook'

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
  const res = await fetch(workflowAPI, {
    method: 'POST',
    body: JSON.stringify(fileInfo),
    headers: {
      'Authorization': `Bearer ${getAccessToken()}`,
      'Content-Type': 'application/json'
    }
  })
  if(!res.ok) {
    const errDetail = await res.json().catch(() => ({}))
    const err = new Error(`程序异常：${res.status}`)
    if(typeof errDetail.detail === 'string') {
      err.message = `${res.status} : ${errDetail.detail}`
    } else {
      err.detail = errDetail
    }
    throw err
  }
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

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
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
  return data;
}