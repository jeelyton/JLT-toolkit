

<script lang="ts">
  import { onMount } from 'svelte';
  import { FileItem, FileStatuses } from './FileItem.svelte';
  import FileListItem from './FileListItem.svelte';
  import { uploadFile, downloadFile, executeWorkflow, FLOW_API_URL } from '$lib/apis/api';
  import { desktopDir } from '@tauri-apps/api/path';

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

  async function fileOutputToXFile(output: any) {
    if(output.filePath){ // local file
      return output
    }
    const desktopPath = await desktopDir()
    const fileName = output.file_path.split('/').pop()
    const filePath = `${desktopPath}/${fileName}`
    let url = output.url
    if(!url) {
      url = `${FLOW_API_URL}/files/${output.file_path}`
    }
    await downloadFile(url, filePath)
    return { filePath, fileName }
  }

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
    const res = await executeWorkflow(workflowAPI, params);
    const outputs = Array.isArray(res) ? res : [res]
    let message = '流程运行完成'
    let level = FileStatuses.COMPLETED
    for(const output of outputs) {
      if(output.type === 'file') {
        const xFile = await fileOutputToXFile(output)
        fileItem.addOutputFile(xFile);
      } else if(output.level) {
        level = output.level
      }
      if(output.message) {
        message = output.message
      }
    }
    fileItem.setMessage(message)
    fileItem.setStatus(level);
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