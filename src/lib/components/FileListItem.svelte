<script lang="ts">
  import { FileItem, FileStatuses } from './FileItem.svelte';
  import { Clock, Loader2, CheckCircle2, AlertCircle, File } from '@lucide/svelte';
  import FileOpen from './FileOpen.svelte';
  
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
    <FileOpen file={fileItem.inputFile!} isInput />
    <div class="flex items-center gap-2">
      {#if fileItem.message}
        <div class="text-sm text-gray-600">{fileItem.message}</div>
      {/if}
      <StatusIcon class="w-4 h-4 {iconColor}" />
    </div>
  </div>
  <div class="flex justify-end border-t border-dashed mt-2 pt-2" class:hidden={fileItem.outputFiles.length === 0}>
    <div class="flex flex-col gap-1">
      {#each fileItem.outputFiles as file}
        <FileOpen {file} />
      {/each}
    </div>
  </div>
</div>