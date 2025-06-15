<script lang="ts">
  import Button from "$lib/components/ui/button/button.svelte";
  import { open } from "@tauri-apps/plugin-dialog";
  import { basename } from "@tauri-apps/api/path";
    import FileQueue from "$lib/components/FileQueue.svelte";
    import { FileItem, FileStatuses } from "$lib/components/FileItem.svelte";
  import { flowApiURL } from "$lib/apis/api";
  

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
  <FileQueue workflowAPI={flowApiURL + '/flows/extract-customer-po'}/>
</div>
  