import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const FileUpload = () => {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  // Mutation for file upload
  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      setIsUploading(true);
      setError(null);
      
      const formData = new FormData();
      formData.append('file', file);
      
      try {
        // In a real app, this would be a real API call
        // For demo, simulate upload progress and success
        
        // Simulate progress updates
        const intervalId = setInterval(() => {
          setUploadProgress(prev => {
            if (prev >= 95) {
              clearInterval(intervalId);
              return 95;
            }
            return prev + 5;
          });
        }, 100);
        
        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        clearInterval(intervalId);
        setUploadProgress(100);
        
        // Simulate API response
        return {
          id: 'file-' + Date.now(),
          filename: file.name,
          status: 'ready'
        };
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.detail || 'Upload failed');
        } else {
          setError('Upload failed');
        }
        throw err;
      } finally {
        setIsUploading(false);
      }
    },
    onSuccess: (data) => {
      // Invalidate and refetch files query
      queryClient.invalidateQueries({ queryKey: ['files'] });
      setTimeout(() => {
        navigate(`/files/${data.id}`);
      }, 500);
    }
  });

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setUploadProgress(0);
      uploadMutation.mutate(acceptedFiles[0]);
    }
  }, [uploadMutation]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    multiple: false, // Only allow one file at a time
    accept: {
      'text/csv': ['.csv'],
      'text/tab-separated-values': ['.tsv', '.tab'],
      'text/plain': ['.txt', '.fasta', '.fastq', '.vcf', '.gtf', '.bed'],
      'application/json': ['.json'],
    }
  });

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Upload Files</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Upload bioinformatics data files for analysis
        </p>
      </div>

      {/* File Drop Zone */}
      <div 
        {...getRootProps()} 
        className={`p-10 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors
          ${isDragActive ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30' : 'border-gray-300 dark:border-gray-700'}
          ${isUploading ? 'pointer-events-none' : ''}
        `}
      >
        <input {...getInputProps()} disabled={isUploading} />
        <div className="text-center">
          <svg 
            className="mx-auto h-12 w-12 text-gray-400" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>

          {isUploading ? (
            <div className="mt-4">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300">Uploading...</div>
              <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                <div 
                  className="bg-blue-600 h-2.5 rounded-full transition-all duration-300" 
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          ) : (
            <>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                {isDragActive
                  ? "Drop your file here..."
                  : "Drag and drop your file here, or click to select a file"}
              </p>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                Supported formats: CSV, TSV, FASTA, FASTQ, VCF, GTF, BED, JSON
              </p>
            </>
          )}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-4 text-sm text-red-800 bg-red-100 dark:bg-red-900/30 dark:text-red-300 rounded-md">
          {error}
        </div>
      )}

      {/* File Types Info */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">Supported File Types</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Sequence Data</h4>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
              <li>FASTA (.fa, .fasta) - Nucleotide or protein sequences</li>
              <li>FASTQ (.fq, .fastq) - Sequence reads with quality scores</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Genomic Data</h4>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
              <li>VCF (.vcf) - Variant Call Format</li>
              <li>GTF (.gtf) - Gene Transfer Format</li>
              <li>BED (.bed) - Browser Extensible Data</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Tabular Data</h4>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
              <li>CSV (.csv) - Comma-separated values</li>
              <li>TSV (.tsv, .tab) - Tab-separated values</li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 dark:text-gray-300 mb-2">Other Formats</h4>
            <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 space-y-1">
              <li>JSON (.json) - JavaScript Object Notation</li>
              <li>TXT (.txt) - Plain text</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileUpload;