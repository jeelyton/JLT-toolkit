

<script lang="ts">
  import { onMount } from 'svelte';
  import { FileItem, FileStatuses } from './FileItem.svelte';
  import FileListItem from './FileListItem.svelte';

  // Props
  const { onProcessFile, maxConcurrent = 5 } = $props<{
    onProcessFile: (fileItem: FileItem) => Promise<void>
    maxConcurrent?: number
  }>();

  // Queue management
  let processingQueue = $state<FileItem[]>([]);
  let activeProcesses = $state(0);

  onMount(() => {
    const handleAddFile = (event: CustomEvent<FileItem>) => {
      processingQueue.push(event.detail);
      processFileQueue();
    };

    window.addEventListener('addFile', handleAddFile as EventListener);
    return () => {
      window.removeEventListener('addFile', handleAddFile as EventListener);
    };
  });


  async function processFileQueue() {
    if (activeProcesses >= maxConcurrent) {
      return;
    }
    const fileItem = processingQueue.find(item => item.status === FileStatuses.PENDING)
    if(!fileItem) {
      return
    }

    activeProcesses++;
    fileItem.setStatus(FileStatuses.PROCESSING);

    try {
      await onProcessFile(fileItem);
    } catch (err: any) {
      console.error(err);
      fileItem.setError(err);
    } finally {
      activeProcesses--;
      processFileQueue(); // Process next file in queue
    }
  }
</script>

{#each processingQueue as fileItem}
  <FileListItem {fileItem} />
{/each}