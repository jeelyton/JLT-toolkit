<script lang="ts">
  import { fetch } from '@tauri-apps/plugin-http';
  import { desktopDir, basename } from "@tauri-apps/api/path";
  import { writeFile, stat } from "@tauri-apps/plugin-fs";
    import { register, unregister } from "@tauri-apps/plugin-global-shortcut";
  import { openPath } from '@tauri-apps/plugin-opener';
  import axios from "axios";
    import { onMount } from "svelte";
    import  * as clipboard from "@tauri-apps/plugin-clipboard-manager";
    import { open } from "@tauri-apps/plugin-dialog";
    import { upload } from "@tauri-apps/plugin-upload";
    import Button from '$lib/components/ui/button/button.svelte';
    import Textarea from '$lib/components/ui/textarea/textarea.svelte';
    import Input from '$lib/components/ui/input/input.svelte';
  const flowApiURL = import.meta.env.VITE_FLOW_API_URL || "http://127.0.0.1:8601"


  function getFileName(contentDisposition: string) {
    // content-disposition: attachment; filename*=utf-8''%E8%BD%AC%E6%8D%A220250613095908.xlsx
    const fileName = decodeURIComponent(contentDisposition.split(/filename\*?=(?:utf-8''|")?/)[1].replace(/"$/, ''))
    return fileName
  }

  async function uploadFile(file: File) {
    const formData = new FormData();
    formData.append("file", file);
    const {data} = await axios.post("https://n8n.17ch.cn/webhook/upload", formData);
    return data
  }

  async function transformFile(fileInfo: any) {
    const response = await axios.post("/flows/extract-customer-po", fileInfo, {
      baseURL: flowApiURL,
      responseType: 'arraybuffer'
    });
    const arrayBuffer = response.data;
    const data = new Uint8Array(arrayBuffer);
    const desktopPath = await desktopDir()
    const fileName = getFileName(response.headers['content-disposition'])
    const filePath = `${desktopPath}/${fileName}`
    await writeFile(filePath, data)
    return {filePath, fileName}
  }

  type FileStatus = 'pending' | 'processing' | 'completed' | 'error';

  interface FileItem {
    id: string;
    name: string;
    status: FileStatus;
    message?: string;
    file: File;
    outputFile?: {filePath: string, fileName: string};
  }

  let fileList = $state<FileItem[]>([]);
  let files = $state<FileList | null>(null);

  function handleFileChange(event: Event) {
    const input = event.target as HTMLInputElement;
    files = input.files;
    if (files && files.length > 0) {
      processFiles(files);
    }
  }

  async function processFiles(files: FileList) {
    const newFiles: FileItem[] = Array.from(files).map(file => ({
      id: file.name + Date.now(),
      name: file.name,
      status: 'processing',
      file
    }));
    
    fileList = [...newFiles, ...fileList];
    
    // Process files in chunks of 5
    for (let i = 0; i < newFiles.length; i += 5) {
      const chunk = newFiles.slice(i, i + 5);
      await Promise.all(chunk.map(async (fileItem) => {
        const currentIndex = fileList.findIndex(f => f.id === fileItem.id);
        try {
          fileList[currentIndex].message = '上传文件中...';
          const data = await uploadFile(fileItem.file);
          fileList[currentIndex].message = '转换文件中...';
          const outputFileName = await transformFile(data);
          fileList[currentIndex].status = 'completed';
          fileList[currentIndex].outputFile = outputFileName;
          fileList[currentIndex].message = '';
        } catch (error) {
          console.error(error)
          fileList[currentIndex].status = 'error';
          fileList[currentIndex].message = error instanceof Error ? error.message : 'Unknown error occurred';
        }
      }));
    }
  }

  async function joinWithComma() {
    let text = await clipboard.readText()
    text = text.split(/[\n\t]+/g).map((line) => `${line.trim()}`).join(',')
    clipboard.writeText(text)
  }

  onMount(() => {
    register('Alt+,',  joinWithComma)
    return () => {
      unregister('Alt+,')
    }
  })

  async function xdownload() {
    const requestData = {
      "mimeType": "application/pdf",
      "fileType": "pdf",
      "fileExtension": "pdf",
      "data": "filesystem-v2",
      "fileName": "吉利通POORD045329.pdf",
      "id": "filesystem-v2:workflows/3RcUHwuI2Wy4zZC1/executions/temp/binary_data/62017fe3-88fe-4070-9818-8f15486b5e28",
      "fileSize": "139 kB",
      "fileKey": "2025-06-13/619df2f70087fef7a3bfa86dea34403ee8c0ea51edb8cf0818a9d881904b0fa7"
    }
    const res = await fetch(flowApiURL + '/flows/extract-customer-po', {
      method: 'POST',
      body: JSON.stringify(requestData),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if(!res.ok) {
      console.error(res)
      return
    }
    const desktopPath = await desktopDir()
    const fileName = getFileName(res.headers.get('content-disposition') || '')
    const filePath = `${desktopPath}/${fileName}`
    const responseData = await res.bytes()
    await writeFile(filePath, responseData)
  }
  

  async function showSelectFile() {
    const files = await open({
      multiple: true,
      filters: [
        { name: 'Images', extensions: ['jpg', 'png'] },
        { name: 'PDF', extensions: ['pdf'] }
      ]
    })
    if(files?.length) {
      const filePath = files[0]
      const fileName = await basename(filePath)
      const fileStat = await stat(filePath)
      const fileSize = fileStat.size
      const res  = await upload('http://127.0.0.1:8601/file/', filePath, ({progress, progressTotal, total}) => {
        console.log(Date.now(), Math.floor((progressTotal/fileSize) * 100), fileSize === progressTotal)
      }, {
        'FileName': encodeURIComponent(fileName),
        TOKEN: 'xwCO2fNRSAbXtQGe',
      })
      console.log(res)
    }
  }

  
</script>

<main class="container">
  <h1>客户采购订单转 Excel</h1>
  <button onclick={xdownload}>Download</button>
  <button onclick={showSelectFile}>选择文件</button>
  <input type="file" onchange={handleFileChange} multiple class="form-input" />
  <input type="text"/>
  <input type="text" class="rounded"/>
  <Button>Click Me</Button>
  <Button variant="outline">Click Me</Button>
  <Textarea/>
  <Input/>
  <p>当前不支持图片及纯图片的 PDF</p>

  <div class="file-list">
    {#each fileList as fileItem}
      <div class="file-card" class:error={fileItem.status === 'error'} class:completed={fileItem.status === 'completed'}>
        <div class="file-info">
          <h3>{fileItem.name}</h3>
          <p class="status">状态: {
            fileItem.status === 'pending' ? '等待处理' :
            fileItem.status === 'processing' ? '处理中' :
            fileItem.status === 'completed' ? '已完成' :
            '处理失败'
          }</p>
          {#if fileItem.outputFile}
            <p class="output">输出文件: <button class="link-button" onclick={() => openPath(fileItem.outputFile!.filePath)}>{fileItem.outputFile.fileName}</button></p>
          {/if}
          {#if fileItem.message}
            <p class="error-message">{fileItem.message}</p>
          {/if}
        </div>
      </div>
    {/each}
  </div>
</main>

<style>
  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 2rem;
  }

  .file-list {
    margin-top: 2rem;
    display: grid;
    gap: 1rem;
  }

  .file-card {
    background: #f5f5f5;
    border-radius: 8px;
    padding: 1rem;
    border: 1px solid #ddd;
  }

  .file-card.error {
    border-color: #ff4444;
    background: #fff5f5;
  }

  .file-card.completed {
    border-color: #44ff44;
    background: #f5fff5;
  }

  .file-info h3 {
    margin: 0 0 0.5rem 0;
    font-size: 1.1rem;
  }

  .status {
    color: #666;
    margin: 0.5rem 0;
  }

  .output {
    color: #0066cc;
    margin: 0.5rem 0;
  }

  .error-message {
    color: #ff4444;
    margin: 0.5rem 0;
  }

  .link-button {
    background: none;
    border: none;
    padding: 0;
    color: #0066cc;
    text-decoration: underline;
    cursor: pointer;
    font: inherit;
  }

  .link-button:hover {
    color: #004499;
  }
</style>
