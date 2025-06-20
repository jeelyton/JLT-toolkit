

<script lang="ts">
  import { onMount } from 'svelte';
  import { FileItem, FileStatuses } from './FileItem.svelte';
  import FileListItem from './FileListItem.svelte';
  import { uploadFile, executeWorkflow } from '$lib/apis/api';

  // Props
  const { onProcessFile = defaultProcessFile, workflowAPI, maxConcurrent = 1 } = $props<{
    onProcessFile?: (fileItem: FileItem) => Promise<void>
    workflowAPI?: string
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

  async function defaultProcessFile(fileItem: FileItem) {
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
    fileItem.setMessage('流程运行中...')
    const output = await executeWorkflow(workflowAPI, params);
    if(output.type === 'file') {
      fileItem.addOutputFile(output);
      fileItem.setMessage('完成')
    } else {
      fileItem.setMessage(JSON.stringify(output))
    }
    fileItem.setStatus(FileStatuses.COMPLETED);
  }


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