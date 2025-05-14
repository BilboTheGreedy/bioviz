// File types
export interface FileInfo {
  file_id: string
  original_filename: string
  file_path: string
  file_size: number
  created_at: string
  row_count: number
  column_count: number
  preview_available: boolean
}

export interface ColumnInfo {
  name: string
  dtype: string
  nullable: boolean
  unique_values?: number
  min_value?: number | string
  max_value?: number | string
  sample_values?: any[]
  missing_count?: number
  missing_percentage?: number
}

export interface SchemaInfo {
  columns: ColumnInfo[]
  row_count: number
  memory_usage: string
  file_size: string
  file_type: string
}

export interface DatasetPreview {
  data: Record<string, any>[]
  total_rows: number
  displayed_rows: number
  start_index: number
  has_more: boolean
}

// Analysis types
export type AnalysisMethod = 
  | 'descriptive'
  | 'diagnostic'
  | 'predictive'
  | 'prescriptive'
  | 'time_series'
  | 'regression'
  | 'cluster'
  | 'factor'
  | 'cohort'
  | 'monte_carlo'
  | 'text_analysis'
  | 'qualitative'

export interface MethodConfig {
  name: string
  description: string
  parameters: Record<string, ParameterConfig>
  required_columns?: string[]
  supports_categorical: boolean
  supports_numerical: boolean
  default_visualizations: string[]
}

export interface ParameterConfig {
  type: 'boolean' | 'string' | 'integer' | 'float' | 'array'
  description: string
  options?: string[]
  min?: number
  max?: number
  default: any
}

export interface VisualizationData {
  type: string
  data: any
  layout: any
  config?: any
}

export interface AnalysisResult {
  summary: Record<string, any>
  visualizations: VisualizationData[]
  tables?: any[]
  metadata?: Record<string, any>
}

export interface AnalysisRequest {
  file_id: string
  method: AnalysisMethod
  params?: Record<string, any>
  target_columns?: string[]
  filter_conditions?: Record<string, any>
}

export interface AnalysisResponse {
  request: AnalysisRequest
  result: AnalysisResult
  execution_time: number
}

// LLM query types
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
}

export interface QueryRequest {
  file_id: string
  query: string
  chat_history?: ChatMessage[]
}

export interface CodeExecutionResult {
  output: any
  error?: string
  visualizations?: any[]
  tables?: any[]
  execution_time: number
}

export interface QueryResponse {
  explanation: string
  code?: string
  execution_type: string
  result?: CodeExecutionResult
  query_time: number
}

// Export types
export interface ExportRequest {
  fig_json: any
  format?: 'png' | 'svg'
  width?: number
  height?: number
  scale?: number
  filename?: string
}

export interface SlideRequest {
  fig_json: any
  title: string
  caption?: string
  filename?: string
}

// App state types
export interface AppState {
  // Current file
  currentFile: FileInfo | null
  fileSchema: SchemaInfo | null
  filePreview: DatasetPreview | null
  
  // Analysis
  availableMethods: Record<string, MethodConfig> | null
  currentAnalysis: AnalysisMethod | null
  analysisParams: Record<string, any>
  analysisResult: AnalysisResponse | null
  
  // LLM chat
  chatHistory: ChatMessage[]
  isLlmEnabled: boolean
  
  // UI state
  isSidebarOpen: boolean
  isChatOpen: boolean
  activeTab: 'dataset' | 'analysis' | 'visualization'
  selectedColumns: string[]
  filterConditions: Record<string, any>
  
  // Status
  isLoading: boolean
  error: string | null
  
  // Actions
  initializeApp: () => void
  setCurrentFile: (file: FileInfo | null) => void
  loadFileSchema: (fileId: string) => Promise<void>
  loadFilePreview: (fileId: string, start?: number, limit?: number) => Promise<void>
  loadAvailableMethods: () => Promise<void>
  setCurrentAnalysis: (method: AnalysisMethod | null) => void
  setAnalysisParams: (params: Record<string, any>) => void
  runAnalysis: () => Promise<void>
  toggleLlm: () => void
  submitLlmQuery: (query: string) => Promise<void>
  executeCode: (code: string) => Promise<void>
  toggleSidebar: () => void
  toggleChat: () => void
  setActiveTab: (tab: 'dataset' | 'analysis' | 'visualization') => void
  setSelectedColumns: (columns: string[]) => void
  setFilterConditions: (conditions: Record<string, any>) => void
  clearError: () => void
  exportChart: (request: ExportRequest) => Promise<string>
  exportSlide: (request: SlideRequest) => Promise<string>
  exportData: (format: 'csv' | 'excel') => Promise<string>
}