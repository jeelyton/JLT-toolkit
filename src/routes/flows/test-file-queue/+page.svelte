<script lang="ts">
  import Button from "$lib/components/ui/button/button.svelte";
    import FileQueue from "$lib/components/FileQueue.svelte";
    import { FileItem, FileStatuses } from "$lib/components/FileItem.svelte";
    import { onMount } from "svelte";


  async function onSelectFile() {
  }
  async function onProcessFile() {
  }
  onMount(() => {
    const filePath = '/Users/brook/Downloads/input-pics/吉利通POORD045329.pdf'
    const fileName = '吉利通POORD045329.pdf'
    const fileItem1 = new FileItem({}, [{filePath, fileName}])
    window.dispatchEvent(new CustomEvent('addFile', { detail: fileItem1 }));
    setTimeout(() => {
      fileItem1.setStatus(FileStatuses.PENDING)
    }, 1000)
    const fileItem2 = new FileItem({}, [{filePath, fileName}])
    window.dispatchEvent(new CustomEvent('addFile', { detail: fileItem2 }));
    fileItem2.setStatus(FileStatuses.PROCESSING)
    fileItem2.setMessage('上传文件中...')
    const fileItem3 = new FileItem({}, [{filePath, fileName}])
    window.dispatchEvent(new CustomEvent('addFile', { detail: fileItem3 }));
    fileItem3.addOutputFile({filePath: filePath, fileName})
    fileItem3.setStatus(FileStatuses.PROCESSING)
    setTimeout(() => {
      fileItem3.setStatus(FileStatuses.COMPLETED)
    }, 1000)
    const fileItem31 = new FileItem({}, [{filePath: filePath, fileName}])
    window.dispatchEvent(new CustomEvent('addFile', { detail: fileItem31 }));
    fileItem31.addOutputFile({filePath, fileName})
    fileItem31.addOutputFile({filePath: filePath + '1', fileName})
    fileItem31.setStatus(FileStatuses.PROCESSING)
    setTimeout(() => {
      fileItem31.setStatus(FileStatuses.COMPLETED)
    }, 1000)
    const fileItem4 = new FileItem({}, [{filePath, fileName}, {filePath, fileName}])
    window.dispatchEvent(new CustomEvent('addFile', { detail: fileItem4 }));
    fileItem4.setStatus(FileStatuses.PROCESSING)
    const err = new Error('出错啦')
    err.detail = {
      code: 1000,
      message: '出错啦'
    }
    fileItem4.setError(err)
    const fileItem41 = new FileItem({}, [{filePath, fileName}])
    window.dispatchEvent(new CustomEvent('addFile', { detail: fileItem41 }));
    fileItem41.setStatus(FileStatuses.PROCESSING)
    fileItem41.setError('test error')
    fileItem41.addOutputFile({filePath, fileName})
    fileItem41.addOutputFile({filePath, fileName})
  })

</script>
  
<h1 class="text-3xl font-semibold text-center mb-5">测试文件队列</h1>
<Button class="w-full border-primary text-primary" variant="outline" onclick={onSelectFile}>选择文件</Button>

<div class="mt-5">
  <FileQueue onProcessFile={onProcessFile}/>
</div>
  