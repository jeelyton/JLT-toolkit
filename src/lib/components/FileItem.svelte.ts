

export type XFile = { filePath: string, fileName: string }

export const FileStatuses = {
    PENDING: 0,
    PROCESSING: 1,
    COMPLETED: 2,
    WARNING: 8,
    ERROR: 4,
} as const
export type FileStatus = typeof FileStatuses[keyof typeof FileStatuses]

export class FileItem {
    status: FileStatus = $state(FileStatuses.PENDING)
    message: string = $state('')
    error: Error | null = $state(null)
    params: Record<string, any> = $state({})
    inputFiles: XFile[] = $state([])
    outputFiles: XFile[] = $state([])
    startTime: Date | null = $state(null)
    duration: number = $state(0)
    constructor(params: Record<string, any>, inputFiles: XFile[]) {
      this.params = params
      this.inputFiles = inputFiles
    }
    setStatus(status: FileStatus) {
      this.status = status
      if(status === FileStatuses.PROCESSING) {
        this.startTime = new Date()
      } else if(status === FileStatuses.COMPLETED || status === FileStatuses.ERROR) {
        this.duration = ((new Date().getTime() - this.startTime!.getTime()) / 1000)
      }
    }
    setMessage(message: string) {
      this.message = message
    }
    addOutputFile(outputFile: XFile) {
      this.outputFiles.push(outputFile)
    }
    setError(error: Error) {
      this.setStatus(FileStatuses.ERROR)
      this.error = error
    }
  }