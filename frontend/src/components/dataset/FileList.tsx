import { useEffect, useState } from 'react'
import { fileService } from '@/services/api'
import { useAppStore } from '@/store/appStore'
import { FileInfo } from '@/types'
import { FileText, Trash2, Loader2 } from 'lucide-react'
import Button from '../ui/Button'

const FileList = () => {
  const [files, setFiles] = useState<FileInfo[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  
  const { currentFile, setCurrentFile } = useAppStore()

  // Load files
  useEffect(() => {
    const loadFiles = async () => {
      try {
        setLoading(true)
        setError(null)
        
        const files = await fileService.listFiles()
        setFiles(files)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load files')
      } finally {
        setLoading(false)
      }
    }
    
    loadFiles()
  }, [])

  // Handle file selection
  const handleSelectFile = (file: FileInfo) => {
    setCurrentFile(file)
  }

  // Handle file deletion
  const handleDeleteFile = async (fileId: string, event: React.MouseEvent) => {
    // Prevent selecting the file when clicking delete
    event.stopPropagation()
    
    try {
      setDeleting(fileId)
      
      await fileService.deleteFile(fileId)
      
      // If the deleted file is the current file, clear it
      if (currentFile?.file_id === fileId) {
        setCurrentFile(null)
      }
      
      // Update file list
      setFiles(files.filter(file => file.file_id !== fileId))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete file')
    } finally {
      setDeleting(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-4">
        <Loader2 className="w-5 h-5 text-primary-500 animate-spin" />
        <span className="ml-2 text-sm">Loading files...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-3 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 rounded text-sm text-red-600 dark:text-red-400">
        {error}
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          No files uploaded yet.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {files.map(file => (
        <div
          key={file.file_id}
          className={`p-3 rounded-md cursor-pointer flex items-center justify-between ${
            currentFile?.file_id === file.file_id
              ? 'bg-primary-100 dark:bg-primary-900 dark:bg-opacity-30 border border-primary-200 dark:border-primary-800'
              : 'hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
          onClick={() => handleSelectFile(file)}
        >
          <div className="flex items-center space-x-2 overflow-hidden">
            <FileText size={18} className="flex-shrink-0 text-slate-600 dark:text-slate-400" />
            <div className="overflow-hidden">
              <p className="font-medium text-sm truncate">{file.original_filename}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {file.row_count.toLocaleString()} rows • {formatFileSize(file.file_size)}
              </p>
            </div>
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            className="p-1 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-500"
            onClick={(e) => handleDeleteFile(file.file_id, e)}
            isLoading={deleting === file.file_id}
          >
            {deleting !== file.file_id && <Trash2 size={16} />}
          </Button>
        </div>
      ))}
    </div>
  )
}

// Helper to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) {
    return `${bytes} B`
  } else if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`
  } else if (bytes < 1024 * 1024 * 1024) {
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  } else {
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
  }
}

export default FileList