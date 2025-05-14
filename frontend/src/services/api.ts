import axios from 'axios'
import {
  FileInfo,
  SchemaInfo,
  DatasetPreview,
  AnalysisRequest,
  AnalysisResponse,
  MethodConfig,
  QueryRequest,
  QueryResponse,
  CodeExecutionResult,
  ExportRequest,
  SlideRequest
} from '../types'

// Define API URL from environment or default to '/api'
const API_URL = typeof import.meta.env !== 'undefined' && import.meta.env.VITE_API_URL 
  ? import.meta.env.VITE_API_URL 
  : '/api';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// File service
export const fileService = {
  // Upload a file
  async uploadFile(file: File): Promise<FileInfo> {
    const formData = new FormData()
    formData.append('file', file)
    
    const response = await api.post<FileInfo>('/files/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    
    return response.data
  },
  
  // Get schema information
  async getSchema(fileId: string): Promise<SchemaInfo> {
    const response = await api.get<SchemaInfo>(`/files/schema/${fileId}`)
    return response.data
  },
  
  // Get data preview
  async getPreview(fileId: string, start = 0, limit = 100): Promise<DatasetPreview> {
    const response = await api.get<DatasetPreview>(`/files/preview/${fileId}`, {
      params: { start, limit },
    })
    return response.data
  },
  
  // Get list of files
  async listFiles(): Promise<FileInfo[]> {
    const response = await api.get<FileInfo[]>('/files/list')
    return response.data
  },
  
  // Delete a file
  async deleteFile(fileId: string): Promise<void> {
    await api.delete(`/files/${fileId}`)
  },
}

// Analysis service
export const analysisService = {
  // Get available analysis methods
  async getAvailableMethods(): Promise<{ methods: Record<string, MethodConfig> }> {
    const response = await api.get<{ methods: Record<string, MethodConfig> }>('/analysis/methods')
    return response.data
  },
  
  // Get method metadata
  async getMethodMetadata(method: string): Promise<Record<string, any>> {
    const response = await api.get<Record<string, any>>(`/analysis/metadata/${method}`)
    return response.data
  },
  
  // Run analysis
  async runAnalysis(request: AnalysisRequest): Promise<AnalysisResponse> {
    const response = await api.post<AnalysisResponse>('/analysis/run', request)
    return response.data
  },
}

// LLM service
export const llmService = {
  // Query data
  async queryData(request: QueryRequest): Promise<QueryResponse> {
    const response = await api.post<QueryResponse>('/llm/query', request)
    return response.data
  },
  
  // Execute code
  async executeCode(fileId: string, code: string, executionType = 'python'): Promise<CodeExecutionResult> {
    const response = await api.post<{ result: CodeExecutionResult }>('/llm/execute-code', { code, execution_type: executionType }, {
      params: { file_id: fileId },
    })
    return response.data.result
  },
}

// Export service
export const exportService = {
  // Export chart
  async exportChart(request: ExportRequest): Promise<string> {
    const response = await api.post('/export/chart', request, {
      responseType: 'blob',
    })
    
    // Create download URL
    const url = window.URL.createObjectURL(new Blob([response.data]))
    
    // Trigger download
    const link = document.createElement('a')
    link.href = url
    link.download = request.filename || `chart.${request.format || 'png'}`
    document.body.appendChild(link)
    link.click()
    link.remove()
    
    return url
  },
  
  // Export slide
  async exportSlide(request: SlideRequest): Promise<string> {
    const response = await api.post('/export/slide', request, {
      responseType: 'blob',
    })
    
    // Create download URL
    const url = window.URL.createObjectURL(new Blob([response.data]))
    
    // Trigger download
    const link = document.createElement('a')
    link.href = url
    link.download = request.filename || `slide.pptx`
    document.body.appendChild(link)
    link.click()
    link.remove()
    
    return url
  },
  
  // Export data
  async exportData(fileId: string, format: 'csv' | 'excel' = 'csv'): Promise<string> {
    const response = await api.post('/export/data', null, {
      params: { file_id: fileId, format },
      responseType: 'blob',
    })
    
    // Create download URL
    const url = window.URL.createObjectURL(new Blob([response.data]))
    
    // Trigger download
    const link = document.createElement('a')
    link.href = url
    link.download = `export.${format === 'csv' ? 'csv' : 'xlsx'}`
    document.body.appendChild(link)
    link.click()
    link.remove()
    
    return url
  },
}