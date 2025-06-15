<script lang="ts">
  import { FileItem, FileStatuses } from './FileItem.svelte';
  import { Clock, Loader2, CheckCircle2, AlertCircle, File } from '@lucide/svelte';
  import FileOpen from './FileOpen.svelte';
  import * as HoverCard from '$lib/components/ui/hover-card';
  
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
  const formattedTime = $derived(fileItem.startTime.toLocaleString());
</script>

<div class="p-3 border rounded mb-2 {itemClass}">
  <div class="flex justify-between items-start">
    <div class="flex flex-col gap-1">
      {#each fileItem.inputFiles as file}
        <FileOpen {file} isInput />
      {/each}
    </div>
    <div class="flex items-center gap-2">
      <div class="text-sm text-gray-500" class:hidden={fileItem.status <= FileStatuses.PROCESSING}>{fileItem.duration}s</div>
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
  <div class="flex justify-between items-center border-t border-dashed mt-2 pt-2" class:hidden={fileItem.status < FileStatuses.PROCESSING}>
    <div class="text-sm text-gray-500">{formattedTime}</div>
    {#if fileItem.error}
      <HoverCard.Root>
        <HoverCard.Trigger><div class="text-sm text-red-500">{fileItem.error.message}</div></HoverCard.Trigger>
        <HoverCard.Content class="w-auto max-w-[600px]">
          <pre class="whitespace-pre-wrap break-words text-xs">{JSON.stringify(fileItem.error.detail, null, 2)}</pre>
        </HoverCard.Content>
      </HoverCard.Root>
    {:else}
      <div class="text-sm text-gray-600">{fileItem.message || ''}</div>
    {/if}
  </div>
</div>