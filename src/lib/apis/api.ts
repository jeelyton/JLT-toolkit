import { stat, writeFile } from "@tauri-apps/plugin-fs";
import { desktopDir } from "@tauri-apps/api/path";
import { upload } from "@tauri-apps/plugin-upload";
import type { XFile } from "$lib/components/FileItem.svelte";

export const IS_DEV = !import.meta.env.VITE_FLOW_API_URL
export  const FLOW_API_URL = import.meta.env.VITE_FLOW_API_URL || "http://127.0.0.1:8601"
export const N8N_API_URL = 'https://n8n.17ch.cn/webhook'

export async function uploadFile(file: XFile, onProgress?: (progress: number) => void) {
    const fileStat = await stat(file.filePath)
    const fileSize = fileStat.size
    const res  = await upload(FLOW_API_URL + '/file/', file.filePath, ({progress, progressTotal, total}) => {
      onProgress?.(Math.floor((progressTotal/fileSize) * 100))
    }, {
      'FileName': encodeURIComponent(file.fileName),
      TOKEN: 'xwCO2fNRSAbXtQGe',
    })
    return JSON.parse(res)
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
      'Content-Type': 'application/json'
    }
  })
  if(!res.ok) {
    const errDetail = await res.json()
    const err = new Error(`程序异常：${res.status}`)
    if(typeof errDetail.detail === 'string') {
      err.message = `${res.status} : ${errDetail.detail}`
    } else {
      err.detail = errDetail
    }
    throw err
  }
  const desktopPath = await desktopDir()
  const fileName = getFileName(res.headers.get('content-disposition') || '')
  const filePath = `${desktopPath}/${fileName}`
  const responseData = await res.bytes()
  await writeFile(filePath, responseData)
  return {filePath, fileName}
}