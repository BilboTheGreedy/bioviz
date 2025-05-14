import { create } from 'zustand'
import {
  AppState,
  FileInfo,
  SchemaInfo,
  DatasetPreview,
  AnalysisMethod,
  AnalysisResponse,
  ChatMessage,
  QueryResponse,
  ExportRequest,
  SlideRequest
} from '../types'
import { fileService, analysisService, llmService, exportService } from '../services/api'

export const useAppStore = create<AppState>((set, get) => ({
  // State
  currentFile: null,
  fileSchema: null,
  filePreview: null,
  availableMethods: null,
  currentAnalysis: null,
  analysisParams: {},
  analysisResult: null,
  chatHistory: [],
  isLlmEnabled: false,
  isSidebarOpen: true,
  isChatOpen: false,
  activeTab: 'dataset',
  selectedColumns: [],
  filterConditions: {},
  isLoading: false,
  error: null,

  // Actions
  initializeApp: async () => {
    try {
      set({ isLoading: true })
      
      // Load available analysis methods
      await get().loadAvailableMethods()
      
      // Load list of files
      const files = await fileService.listFiles()
      if (files.length > 0) {
        // Set the first file as current
        await get().setCurrentFile(files[0])
      }
      
      set({ isLoading: false })
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to initialize app' 
      })
    }
  },

  setCurrentFile: async (file: FileInfo | null) => {
    set({ currentFile: file })
    
    if (file) {
      try {
        // Load the file schema and preview
        await get().loadFileSchema(file.file_id)
        await get().loadFilePreview(file.file_id)
        
        // Reset analysis and parameters
        set({
          currentAnalysis: null,
          analysisParams: {},
          analysisResult: null,
          selectedColumns: [],
          filterConditions: {},
          chatHistory: [],
        })
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to load file data' 
        })
      }
    } else {
      // Clear data if no file is selected
      set({
        fileSchema: null,
        filePreview: null,
        currentAnalysis: null,
        analysisParams: {},
        analysisResult: null,
        selectedColumns: [],
        filterConditions: {},
        chatHistory: [],
      })
    }
  },

  loadFileSchema: async (fileId: string) => {
    try {
      set({ isLoading: true })
      const schema = await fileService.getSchema(fileId)
      set({ fileSchema: schema, isLoading: false })
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to load schema' 
      })
    }
  },

  loadFilePreview: async (fileId: string, start = 0, limit = 100) => {
    try {
      set({ isLoading: true })
      const preview = await fileService.getPreview(fileId, start, limit)
      set({ filePreview: preview, isLoading: false })
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to load preview' 
      })
    }
  },

  loadAvailableMethods: async () => {
    try {
      set({ isLoading: true })
      const methods = await analysisService.getAvailableMethods()
      set({ availableMethods: methods.methods, isLoading: false })
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to load analysis methods' 
      })
    }
  },

  setCurrentAnalysis: (method: AnalysisMethod | null) => {
    const { availableMethods } = get()
    
    set({ currentAnalysis: method })
    
    // If method is selected and available, set default parameters
    if (method && availableMethods && availableMethods[method]) {
      const paramConfigs = availableMethods[method].parameters
      const defaultParams: Record<string, any> = {}
      
      // Set default values for each parameter
      Object.entries(paramConfigs).forEach(([key, config]) => {
        defaultParams[key] = config.default
      })
      
      set({ analysisParams: defaultParams })
    } else {
      set({ analysisParams: {} })
    }
  },

  setAnalysisParams: (params: Record<string, any>) => {
    set({ analysisParams: params })
  },

  runAnalysis: async () => {
    const { currentFile, currentAnalysis, analysisParams, selectedColumns, filterConditions } = get()
    
    if (!currentFile || !currentAnalysis) {
      set({ error: 'No file or analysis method selected' })
      return
    }
    
    try {
      set({ isLoading: true })
      
      const request = {
        file_id: currentFile.file_id,
        method: currentAnalysis,
        params: analysisParams,
        target_columns: selectedColumns.length > 0 ? selectedColumns : undefined,
        filter_conditions: Object.keys(filterConditions).length > 0 ? filterConditions : undefined
      }
      
      const result = await analysisService.runAnalysis(request)
      set({ analysisResult: result, isLoading: false, activeTab: 'visualization' })
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to run analysis' 
      })
    }
  },

  toggleLlm: () => {
    set(state => ({ isLlmEnabled: !state.isLlmEnabled }))
  },

  submitLlmQuery: async (query: string) => {
    const { currentFile, chatHistory } = get()
    
    if (!currentFile) {
      set({ error: 'No file selected' })
      return
    }
    
    try {
      set({ isLoading: true })
      
      // Add user message to chat history
      const userMessage: ChatMessage = {
        role: 'user',
        content: query,
        timestamp: new Date().toISOString()
      }
      
      const updatedHistory = [...chatHistory, userMessage]
      set({ chatHistory: updatedHistory })
      
      // Send query to LLM
      const response = await llmService.queryData({
        file_id: currentFile.file_id,
        query,
        chat_history: updatedHistory
      })
      
      // Add assistant response to chat history
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: `${response.explanation}${response.code ? `\n\n\`\`\`python\n${response.code}\n\`\`\`` : ''}`,
        timestamp: new Date().toISOString()
      }
      
      set({ 
        chatHistory: [...updatedHistory, assistantMessage],
        isLoading: false 
      })
      
      return response
    } catch (error) {
      // Add error message to chat history
      const errorMessage: ChatMessage = {
        role: 'system',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to process query'}`,
        timestamp: new Date().toISOString()
      }
      
      set({ 
        chatHistory: [...get().chatHistory, errorMessage],
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to process query'
      })
    }
  },

  executeCode: async (code: string) => {
    const { currentFile } = get()
    
    if (!currentFile) {
      set({ error: 'No file selected' })
      return
    }
    
    try {
      set({ isLoading: true })
      
      const result = await llmService.executeCode(currentFile.file_id, code)
      set({ isLoading: false })
      
      return result
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to execute code' 
      })
    }
  },

  toggleSidebar: () => {
    set(state => ({ isSidebarOpen: !state.isSidebarOpen }))
  },

  toggleChat: () => {
    set(state => ({ isChatOpen: !state.isChatOpen }))
  },

  setActiveTab: (tab: 'dataset' | 'analysis' | 'visualization') => {
    set({ activeTab: tab })
  },

  setSelectedColumns: (columns: string[]) => {
    set({ selectedColumns: columns })
  },

  setFilterConditions: (conditions: Record<string, any>) => {
    set({ filterConditions: conditions })
  },

  clearError: () => {
    set({ error: null })
  },

  exportChart: async (request: ExportRequest) => {
    try {
      set({ isLoading: true })
      const filePath = await exportService.exportChart(request)
      set({ isLoading: false })
      return filePath
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to export chart' 
      })
      throw error
    }
  },

  exportSlide: async (request: SlideRequest) => {
    try {
      set({ isLoading: true })
      const filePath = await exportService.exportSlide(request)
      set({ isLoading: false })
      return filePath
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to export slide' 
      })
      throw error
    }
  },

  exportData: async (format: 'csv' | 'excel') => {
    const { currentFile } = get()
    
    if (!currentFile) {
      set({ error: 'No file selected' })
      throw new Error('No file selected')
    }
    
    try {
      set({ isLoading: true })
      const filePath = await exportService.exportData(currentFile.file_id, format)
      set({ isLoading: false })
      return filePath
    } catch (error) {
      set({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to export data' 
      })
      throw error
    }
  }
}))