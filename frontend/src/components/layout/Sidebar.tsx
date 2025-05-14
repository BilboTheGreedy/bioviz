import { useCallback } from 'react'
import { useAppStore } from '@/store/appStore'
import { useTheme } from '@/hooks/useTheme'
import { 
  UploadCloud, 
  FileText, 
  BarChart4, 
  BrainCircuit,
  X, 
  Moon, 
  Sun,
  Menu
} from 'lucide-react'
import FileUploader from '../dataset/FileUploader'
import FileList from '../dataset/FileList'
import AnalysisSelector from '../analysis/AnalysisSelector'
import { motion } from 'framer-motion'

const Sidebar = () => {
  const { 
    currentFile, 
    availableMethods,
    currentAnalysis,
    isSidebarOpen,
    isLlmEnabled,
    toggleLlm,
    toggleSidebar
  } = useAppStore()
  
  const { theme, toggleTheme } = useTheme()
  
  const handleToggleLlm = useCallback(() => {
    toggleLlm()
  }, [toggleLlm])
  
  if (!isSidebarOpen) {
    return (
      <button
        onClick={toggleSidebar}
        className="fixed top-4 left-4 z-20 p-2 rounded-md bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
        aria-label="Open sidebar"
      >
        <Menu size={20} />
      </button>
    )
  }
  
  return (
    <motion.aside
      initial={{ x: -300 }}
      animate={{ x: 0 }}
      className="w-80 h-screen bg-slate-100 dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden z-10"
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-700">
        <h1 className="text-xl font-semibold">BioViz</h1>
        <div className="flex items-center space-x-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
          </button>
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="font-medium mb-2 flex items-center">
            <UploadCloud size={18} className="mr-2" />
            Upload Dataset
          </h2>
          <FileUploader />
        </div>
        
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="font-medium mb-2 flex items-center">
            <FileText size={18} className="mr-2" />
            Your Datasets
          </h2>
          <FileList />
        </div>
        
        {currentFile && (
          <div className="p-4 border-b border-slate-200 dark:border-slate-700">
            <h2 className="font-medium mb-2 flex items-center">
              <BarChart4 size={18} className="mr-2" />
              Analysis Methods
            </h2>
            {availableMethods ? (
              <AnalysisSelector
                methods={availableMethods}
                currentMethod={currentAnalysis}
              />
            ) : (
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Loading analysis methods...
              </p>
            )}
          </div>
        )}
        
        <div className="p-4">
          <h2 className="font-medium mb-2 flex items-center">
            <BrainCircuit size={18} className="mr-2" />
            LLM Chat Assistant
          </h2>
          <div className="flex items-center">
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                value="" 
                className="sr-only peer"
                checked={isLlmEnabled}
                onChange={handleToggleLlm}
              />
              <div className="w-11 h-6 bg-slate-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary-300 dark:peer-focus:ring-primary-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary-600"></div>
              <span className="ml-3 text-sm font-medium">
                {isLlmEnabled ? 'Enabled' : 'Disabled'}
              </span>
            </label>
          </div>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Ask questions about your data using natural language.
          </p>
        </div>
      </div>
      
      <div className="p-4 border-t border-slate-200 dark:border-slate-700 text-xs text-center text-slate-500 dark:text-slate-400">
        BioViz v0.1.0 - Running locally
      </div>
    </motion.aside>
  )
}

export default Sidebar