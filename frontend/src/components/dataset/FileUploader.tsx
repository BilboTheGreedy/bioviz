import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import { UploadCloud, AlertCircle } from 'lucide-react'
import { fileService } from '@/services/api'
import { useAppStore } from '@/store/appStore'
import Button from '../ui/Button'

const FileUploader = () => {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { setCurrentFile } = useAppStore()

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      if (acceptedFiles.length === 0) return

      try {
        setUploading(true)
        setError(null)

        const file = acceptedFiles[0]
        
        // Check file type
        if (!file.name.endsWith('.csv') && !file.name.endsWith('.xlsx')) {
          setError('Only CSV and Excel files are supported')
          return
        }
        
        // Check file size (200MB limit)
        if (file.size > 200 * 1024 * 1024) {
          setError('File is too large (max 200MB)')
          return
        }

        // Upload file
        const fileInfo = await fileService.uploadFile(file)
        
        // Set as current file
        setCurrentFile(fileInfo)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to upload file')
      } finally {
        setUploading(false)
      }
    },
    [setCurrentFile]
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    multiple: false,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
    },
  })

  return (
    <div className="mb-4">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-4 transition-colors cursor-pointer ${
          isDragActive
            ? 'border-primary-500 bg-primary-50 dark:bg-primary-900 dark:bg-opacity-20'
            : 'border-slate-300 dark:border-slate-600 hover:border-primary-400 dark:hover:border-primary-500'
        }`}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center text-center py-4">
          <UploadCloud
            className={`w-10 h-10 mb-2 ${
              isDragActive ? 'text-primary-500' : 'text-slate-400 dark:text-slate-500'
            }`}
          />
          <p className="text-sm font-medium mb-1">
            {isDragActive ? 'Drop the file here' : 'Drag & drop a file here'}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-2">
            Supports CSV and Excel (.xlsx) files
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-2"
            isLoading={uploading}
          >
            Browse Files
          </Button>
        </div>
      </div>

      {error && (
        <div className="mt-2 p-2 bg-red-50 dark:bg-red-900 dark:bg-opacity-20 rounded text-sm text-red-600 dark:text-red-400 flex items-start">
          <AlertCircle className="w-4 h-4 mr-1 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  )
}

export default FileUploader