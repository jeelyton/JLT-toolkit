<script lang="ts">
  import Button from "$lib/components/ui/button/button.svelte";
  import { open } from "@tauri-apps/plugin-dialog";
  import { basename, desktopDir } from "@tauri-apps/api/path";
  import { writeFile } from "@tauri-apps/plugin-fs";
    import FileQueue from "$lib/components/FileQueue.svelte";
    import { FileItem, FileStatuses } from "$lib/components/FileItem.svelte";
  import { uploadFile, flowApiURL } from "$lib/apis/api";
    import { onMount } from "svelte";

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

  async function onProcessFile(fileItem: FileItem) {
    // const fileInfo = await uploadFile(fileItem.inputFile!);
    // const outputFile = await transformFile(fileInfo);
    // fileItem.addOutputFile(outputFile);
    // fileItem.setStatus('completed');
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
        // The FileQueue component will handle the queue management
        window.dispatchEvent(new CustomEvent('addFile', { detail: fileItem }));
      }
    }
  }
  onMount(() => {
    const fileItem1 = new FileItem({filePath: 'test.txt', fileName: 'test.txt'})
    window.dispatchEvent(new CustomEvent('addFile', { detail: fileItem1 }));
    setTimeout(() => {
      fileItem1.setStatus(FileStatuses.PENDING)
    }, 1000)
    const fileItem2 = new FileItem({filePath: 'test.txt', fileName: 'test.txt'})
    window.dispatchEvent(new CustomEvent('addFile', { detail: fileItem2 }));
    fileItem2.setStatus(FileStatuses.PROCESSING)
    fileItem2.setMessage('上传文件中...')
    const fileItem3 = new FileItem({filePath: 'test.txt', fileName: 'test.txt'})
    window.dispatchEvent(new CustomEvent('addFile', { detail: fileItem3 }));
    fileItem3.addOutputFile({filePath: 'test.txt', fileName: 'test.txt'})
    fileItem3.setStatus(FileStatuses.COMPLETED)
    const fileItem31 = new FileItem({filePath: 'test.txt', fileName: 'test.txt'})
    window.dispatchEvent(new CustomEvent('addFile', { detail: fileItem31 }));
    fileItem31.addOutputFile({filePath: 'test.txt', fileName: 'test.txt'})
    fileItem31.addOutputFile({filePath: 'test.txt', fileName: 'test.txt'})
    fileItem31.setStatus(FileStatuses.COMPLETED)
    const fileItem4 = new FileItem({filePath: 'test.txt', fileName: 'test.txt'})
    window.dispatchEvent(new CustomEvent('addFile', { detail: fileItem4 }));
    fileItem4.setError('test error')
    const fileItem41 = new FileItem({filePath: 'test.txt', fileName: 'test.txt'})
    window.dispatchEvent(new CustomEvent('addFile', { detail: fileItem41 }));
    fileItem41.setError('test error')
    fileItem41.addOutputFile({filePath: 'test.txt', fileName: 'test.txt'})
    fileItem41.addOutputFile({filePath: 'test.txt', fileName: 'test.txt'})
  })

</script>
  
<h1 class="text-3xl font-semibold text-center mb-5">测试文件队列</h1>
<Button class="w-full mt-2" variant="outline" onclick={onSelectFile}>选择文件</Button>

<FileQueue onProcessFile={onProcessFile}/>
  