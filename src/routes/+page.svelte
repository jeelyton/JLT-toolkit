<script lang="ts">
  import { desktopDir } from "@tauri-apps/api/path";
  import { writeFile } from "@tauri-apps/plugin-fs";
  import { openPath } from '@tauri-apps/plugin-opener';
  import axios from "axios";
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

  async function openFile(filePath: string) {
    const command = currentPlatform === 'windows' 
      ? Command.create('cmd', ['/c', 'start', '', filePath])
      : Command.create('open', [filePath]);
    await command.execute();
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

  
</script>

<main class="container">
  <h1>客户采购订单转 Excel</h1>
  <input type="file" onchange={handleFileChange} multiple />
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
