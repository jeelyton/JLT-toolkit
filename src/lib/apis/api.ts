import { stat } from "@tauri-apps/plugin-fs";
import { upload } from "@tauri-apps/plugin-upload";
import type { XFile } from "$lib/components/FileItem.svelte";

export  const flowApiURL = import.meta.env.VITE_FLOW_API_URL || "http://127.0.0.1:8601"

export async function uploadFile(file: XFile) {
    const fileStat = await stat(file.filePath)
    const fileSize = fileStat.size
    const res  = await upload(flowApiURL + '/file/', file.filePath, ({progress, progressTotal, total}) => {
      // console.log(Date.now(), Math.floor((progressTotal/fileSize) * 100),fileSize === progressTotal)
    }, {
      'FileName': encodeURIComponent(file.fileName),
      TOKEN: 'xwCO2fNRSAbXtQGe',
    })
    return JSON.parse(res)
}