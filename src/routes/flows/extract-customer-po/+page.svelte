<script lang="ts">
  import Button from "$lib/components/ui/button/button.svelte";
  import { open } from "@tauri-apps/plugin-dialog";
  import { basename, desktopDir } from "@tauri-apps/api/path";
  import { writeFile } from "@tauri-apps/plugin-fs";
    import FileQueue from "$lib/components/FileQueue.svelte";
    import { FileItem } from "$lib/components/FileItem.svelte";
  import { uploadFile, flowApiURL } from "$lib/apis/api";

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
    const fileInfo = await uploadFile(fileItem.inputFile!);
    const outputFile = await transformFile(fileInfo);
    fileItem.addOutputFile(outputFile);
    fileItem.setStatus('completed');
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

</script>
  
<h1 class="text-3xl font-semibold text-center mb-5">客户采购订单转 Excel</h1>
<Button class="w-full" variant="outline" onclick={onSelectFile}>选择文件</Button>

<div class="mt-5">
  <FileQueue onProcessFile={onProcessFile}/>
</div>
  