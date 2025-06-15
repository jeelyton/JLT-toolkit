<script lang="ts">
    import { exists } from '@tauri-apps/plugin-fs'

  import { ArrowDownToLine as FileDown, ArrowUpToLine as FileUp } from '@lucide/svelte';
  import { openPath } from '@tauri-apps/plugin-opener';
  import type { XFile } from './FileItem.svelte';
  import { toast } from "svelte-sonner";

  const { file, isInput = false } = $props<{
    isInput?: boolean
    file: XFile
  }>();
  const openFile = async (filePath: string) => {
    if(!await exists(filePath)) {
      return toast.error('文件不存在或已移动！')
    }
    await openPath(filePath)
  }
  const typeClass = $derived(isInput ? 'text-gray-700 hover:text-gray-800' : 'text-blue-500 hover:text-blue-800')
</script>
<button 
class="text-sm flex items-center gap-1 group {typeClass}"
onclick={() => openFile(file.filePath)}
title={`点击打开文件：${file.filePath}`}
>
{#if isInput}
    <FileUp class="size-3" />
{/if}
{file.fileName}
{#if !isInput}
    <FileDown class="size-3" />
{/if}
</button>