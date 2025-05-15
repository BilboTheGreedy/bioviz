export interface User {
  id: string;
  name: string;
}

export interface FileMetadata {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadedAt: string;
  description?: string;
}

export interface Dataset {
  id: string;
  name: string;
  files: FileMetadata[];
  createdAt: string;
  description?: string;
}

export interface AnalysisMethod {
  id: string;
  name: string;
  description: string;
  category: 'descriptive' | 'predictive' | 'prescriptive' | 'diagnostic';
  compatibility: string[]; // File types this method works with
  parameters?: AnalysisParameter[];
}

export interface AnalysisParameter {
  name: string;
  type: 'string' | 'number' | 'boolean' | 'select';
  label: string;
  defaultValue?: string | number | boolean;
  options?: string[]; // For select type
  required: boolean;
}

export interface AnalysisResult {
  id: string;
  analysisId: string;
  datasetId: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt: string;
  completedAt?: string;
  result?: Record<string, unknown>;
  error?: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  contextDatasetId?: string;
  contextAnalysisId?: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';