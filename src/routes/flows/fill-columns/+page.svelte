<script lang="ts">
  import Button from "$lib/components/ui/button/button.svelte";
  import { open } from "@tauri-apps/plugin-dialog";
  import { basename } from "@tauri-apps/api/path";
  import FileQueue from "$lib/components/FileQueue.svelte";
  import {FileItem} from "$lib/components/FileItem.svelte";
  import { useDragDrop } from "$lib/hooks/useDragDrop";

  async function addFile(filePath: string) {
    const fileName = await basename(filePath)
    const fileItem = new FileItem({}, [{filePath, fileName}]);
    window.dispatchEvent(new CustomEvent('addFile', { detail: fileItem }));
  }

  const fileFilters = [
    { name: 'Excel', extensions: ['xlsx'] }
  ]
  async function onSelectFile() {
    const files = await open({
      multiple: true,
      filters: fileFilters
    })
    if(files?.length) {
      for(const file of files) {
        await addFile(file)
      }
    }
  }

  useDragDrop(addFile, fileFilters);
</script>
  
<h1 class="text-3xl font-semibold text-center mb-5">Excel 关联数据查询</h1>
<Button class="w-full border-primary text-primary" variant="outline" onclick={onSelectFile}>选择文件</Button>

<div class="mt-5">
  <FileQueue workflowAPI={'/flows/fill-columns'} maxConcurrent={5}/>
</div>
  