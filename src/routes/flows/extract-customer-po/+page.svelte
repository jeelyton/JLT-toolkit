<script lang="ts">
  import Button from "$lib/components/ui/button/button.svelte";
  import { open } from "@tauri-apps/plugin-dialog";
  import { basename, desktopDir } from "@tauri-apps/api/path";
  import { writeFile } from "@tauri-apps/plugin-fs";
    import FileQueue from "$lib/components/FileQueue.svelte";
    import { FileItem, FileStatuses } from "$lib/components/FileItem.svelte";
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
      const errDetail =await res.json()
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

  async function onProcessFile(fileItem: FileItem) {
    const params = fileItem.params
    if(fileItem.inputFiles.length > 0) {
      params.input_files = []
      for(const file of fileItem.inputFiles) {
        const progressInfo = `${params.input_files.length + 1}/${fileItem.inputFiles.length}`
        const fileInfo = await uploadFile(file, (progress) => {
          fileItem.setMessage(`上传文件 ${progressInfo} ${progress}%...`)
        });
        params.input_files.push(fileInfo)
      }
    }
    fileItem.setMessage('转换文件中...')
    const outputFile = await transformFile(params);
    fileItem.addOutputFile(outputFile);
    fileItem.setStatus(FileStatuses.COMPLETED);
    fileItem.setMessage('完成')
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
        const fileItem = new FileItem({}, [{filePath: file, fileName}]);
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
  