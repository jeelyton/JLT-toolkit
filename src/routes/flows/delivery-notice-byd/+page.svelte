<script lang="ts">
  import Button from "$lib/components/ui/button/button.svelte";
  import { open } from "@tauri-apps/plugin-dialog";
  import { basename } from "@tauri-apps/api/path";
  import FileQueue from "$lib/components/FileQueue.svelte";
  import {FileItem} from "$lib/components/FileItem.svelte";
  import { useDragDrop2 } from "$lib/hooks/useDragDrop";
  import {N8N_API_URL, uploadFile} from '$lib/apis/api'
  import { toast } from "svelte-sonner";

  async function addFile(filePaths: string[]) {
    if(filePaths.length !== 2) {
      return toast.error('文件数量不对')
    }
    let fileName1 = await basename(filePaths[0])
    let fileName2 = await basename(filePaths[1])
    const fileInfo1 = await uploadFile({filePath: filePaths[0], fileName: fileName1}, (progress) => {});
    const fileInfo2 = await uploadFile({filePath: filePaths[1], fileName: fileName2}, (progress) => {});
    const fileItem = new FileItem({file1: fileInfo1, file2: fileInfo2, __TITLE: `${filePaths[0]}`}, []);
    window.dispatchEvent(new CustomEvent('addFile', {detail: fileItem}));
  }

  const fileFilters = [
    { name: 'Excel', extensions: ['xlsx'] }
  ]
  async function onSelectFile() {
    const files = await open({
      multiple: true,
      filters: fileFilters
    })
    if(files) {
      addFile(files!)
    }
  }

  useDragDrop2(addFile, fileFilters);
</script>
  
<h1 class="text-3xl font-semibold text-center mb-5">比亚迪发货</h1>
<Button class="w-full border-primary text-primary" variant="outline" onclick={onSelectFile}>选择文件</Button>

<div class="mt-5">
  <FileQueue workflowAPI={`${N8N_API_URL}/byd-delivery`} maxConcurrent={5}/>
</div>
  