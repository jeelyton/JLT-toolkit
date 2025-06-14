<script lang="ts">
  import Button from "$lib/components/ui/button/button.svelte";
  import { open } from "@tauri-apps/plugin-dialog";
  import { desktopDir, basename } from "@tauri-apps/api/path";
  import { writeFile, stat } from "@tauri-apps/plugin-fs";
  import { upload } from "@tauri-apps/plugin-upload";

  const flowApiURL = import.meta.env.VITE_FLOW_API_URL || "http://127.0.0.1:8601"
  const MAX_CONCURRENT_PROCESSES = 5;

  // Queue management
  let processingQueue: FileItem[] = $state([]);
  let activeProcesses = $state(0);

  function getFileName(contentDisposition: string) {
    // content-disposition: attachment; filename*=utf-8''%E8%BD%AC%E6%8D%A220250613095908.xlsx
    const fileName = decodeURIComponent(contentDisposition.split(/filename\*?=(?:utf-8''|")?/)[1].replace(/"$/, ''))
    return fileName
  }

  async function transformFile(fileInfo: any) {
    const res = await fetch(flowApiURL + '/flows/extract-customer-po', {
      method: 'POST',
      body: JSON.stringify(fileInfo),
      headers: {
        'Content-Type': 'application/json'
      }
    })
    if(!res.ok) {
      const err = new Error(`程序出错：${res.status} ${res.statusText}`)
      err.detail = await res.json()
      throw err
    }
    const desktopPath = await desktopDir()
    const fileName = getFileName(res.headers.get('content-disposition') || '')
    const filePath = `${desktopPath}/${fileName}`
    const responseData = await res.bytes()
    await writeFile(filePath, responseData)
    return {filePath, fileName}
  }


  async function uploadFile(file: XFile) {
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

  type FileStatus = 'pending' | 'processing' | 'completed' | 'error';
  type XFile = { filePath: string, fileName: string }

  class FileItem {
    status: FileStatus = $state('pending')
    message: string = $state('')
    inputFile: XFile | null = $state(null)
    outputFiles: XFile[] = $state([])
    constructor(inputFile: XFile) {
      this.inputFile = inputFile
    }
    setStatus(status: FileStatus) {
      this.status = status
    }
    setMessage(message: string) {
      this.message = message
    }
    addOutputFile(outputFile: XFile) {
      this.outputFiles.push(outputFile)
    }
    setError(message: string) {
      this.status = 'error'
      this.message = message
    }
  }

  async function processFileQueue() {
    if (activeProcesses >= MAX_CONCURRENT_PROCESSES) {
      return;
    }
    const fileItem = processingQueue.find(item => item.status === 'pending')
    if(!fileItem) {
      return
    }

    activeProcesses++;
    fileItem.setStatus('processing');

    try {
      const fileInfo = await uploadFile(fileItem.inputFile!);
      const outputFile = await transformFile(fileInfo);
      fileItem.addOutputFile(outputFile);
      fileItem.setStatus('completed');
    } catch (err: any) {
      console.error(err, err.detail);
      fileItem.setError(err.message || '处理文件时出错');
    } finally {
      activeProcesses--;
      processFileQueue(); // Process next file in queue
    }
  }

  async function onSelectFile() {
    const files = await open({
      multiple: true,
      filters: [
        { name: 'Images', extensions: ['jpg', 'png'] },
        { name: 'PDF', extensions: ['pdf'] }
      ]
    })
    if(files?.length) {
      for(const file of files) {
        const fileName = await basename(file)
        const fileItem = new FileItem({filePath: file, fileName});
        processingQueue.push(fileItem);
        processFileQueue();
      }
    }
  }

</script>
  
<h1 class="text-3xl font-semibold text-center mb-5">客户采购订单转 Excel</h1>
<Button class="w-full mt-2" variant="outline" onclick={onSelectFile}>选择文件</Button>


{#each processingQueue as fileItem}
  <div class="p-2 border rounded mb-2">
    <div class="flex justify-between items-center">
      <span>{fileItem.inputFile?.fileName}</span>
      <span class="px-2 py-1 rounded text-sm" class:bg-yellow-100={fileItem.status === 'pending'} class:bg-blue-100={fileItem.status === 'processing'} class:bg-green-100={fileItem.status === 'completed'} class:bg-red-100={fileItem.status === 'error'}>
        {fileItem.status === 'pending' && '等待中'}
        {fileItem.status === 'processing' && '处理中'}
        {fileItem.status === 'completed' && '已完成'}
        {fileItem.status === 'error' && '错误'}
      </span>
    </div>
    {#if fileItem.message}
      <div class="text-sm text-gray-600 mt-1">{fileItem.message}</div>
    {/if}
  </div>
{/each}
  