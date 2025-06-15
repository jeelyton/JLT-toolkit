<script lang="ts">
  import { FileItem, FileStatuses } from './FileItem.svelte';
  import { Clock, Loader2, CheckCircle2, AlertCircle } from '@lucide/svelte';
  
  const { fileItem } = $props<{
    fileItem: FileItem
  }>();
  
  const itemClasses = {
    [FileStatuses.PENDING]: 'border-gray-300',
    [FileStatuses.PROCESSING]: 'border-blue-300',
    [FileStatuses.COMPLETED]: 'border-green-500',
    [FileStatuses.ERROR]: 'border-red-300',
  } as const;
  
  const statusIcons = {
    [FileStatuses.PENDING]: Clock,
    [FileStatuses.PROCESSING]: Loader2,
    [FileStatuses.COMPLETED]: CheckCircle2,
    [FileStatuses.ERROR]: AlertCircle,
  } as const;

  const iconColors = {
    [FileStatuses.PENDING]: 'text-gray-500',
    [FileStatuses.PROCESSING]: 'text-blue-500 animate-spin',
    [FileStatuses.COMPLETED]: 'text-green-500',
    [FileStatuses.ERROR]: 'text-red-500',
  } as const;
  
  const itemClass = $derived(itemClasses[fileItem.status as keyof typeof itemClasses]);
  const StatusIcon = $derived(statusIcons[fileItem.status as keyof typeof statusIcons]);
  const iconColor = $derived(iconColors[fileItem.status as keyof typeof iconColors]);
</script>

<div class="p-3 border rounded mb-2 {itemClass}">
  <div class="flex justify-between items-center">
    <span>{fileItem.inputFile?.fileName}</span>
    <div class="flex items-center gap-2">
      <StatusIcon class="w-4 h-4 {iconColor}" />
    </div>
  </div>
  <div class="flex flex-col items-end" class:hidden={fileItem.outputFiles.length === 0}>
    <div class="text-sm font-medium text-gray-700 mb-1">输出文件</div>
    {#each fileItem.outputFiles as outputFile}
      <div class="text-sm text-gray-600">
        {outputFile.fileName}
      </div>
    {/each}
  </div>
  {#if fileItem.message}
    <div class="text-sm text-gray-600 mt-1">{fileItem.message}</div>
  {/if}
</div>