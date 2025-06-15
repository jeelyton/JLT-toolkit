

export type XFile = { filePath: string, fileName: string }

export const FileStatuses = {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    ERROR: 'error'
} as const
export type FileStatus = typeof FileStatuses[keyof typeof FileStatuses]

export class FileItem {
    status: FileStatus = $state(FileStatuses.PENDING)
    message: string = $state('')
    inputFile: XFile | null = $state(null)
    outputFiles: XFile[] = $state([])
    constructor(inputFile: XFile) {
      this.inputFile = inputFile
    }
    setStatus(status: FileStatus) {
      this.status = status
    }
    setMessage(message: string) {
      this.message = message
    }
    addOutputFile(outputFile: XFile) {
      this.outputFiles.push(outputFile)
    }
    setError(message: string) {
      this.status = FileStatuses.ERROR
      this.message = message
    }
  }