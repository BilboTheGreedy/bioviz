import { useMemo } from 'react'
import { useAppStore } from '@/store/appStore'
import { Tabs, Tab } from '@/components/ui/Tabs'
import DatasetView from '@/components/dataset/DatasetView'
import AnalysisView from '@/components/analysis/AnalysisView'
import VisualizationView from '@/components/visualization/VisualizationView'
import ChatPanel from '@/components/chat/ChatPanel'
import { Menu, MessageSquare, Save, FileDown } from 'lucide-react'
import { ExportRequest, SlideRequest } from '@/types'

const MainContent = () => {
  const {
    currentFile,
    fileSchema,
    filePreview,
    currentAnalysis,
    analysisResult,
    activeTab,
    setActiveTab,
    isLlmEnabled,
    isChatOpen,
    toggleChat,
    toggleSidebar,
    exportChart,
    exportSlide,
    exportData
  } = useAppStore()

  // Only show visualization tab if we have analysis results
  const tabs = useMemo(() => {
    const availableTabs = [
      { id: 'dataset', label: 'Dataset' },
      { id: 'analysis', label: 'Analysis' },
    ]
    
    if (analysisResult) {
      availableTabs.push({ id: 'visualization', label: 'Visualization' })
    }
    
    return availableTabs
  }, [analysisResult])

  // Handle exporting chart from visualization
  const handleExportChart = async (figJson: any, format: 'png' | 'svg' = 'png') => {
    try {
      const request: ExportRequest = {
        fig_json: figJson,
        format,
        scale: 2.0,
        filename: `${currentFile?.original_filename.split('.')[0]}_chart.${format}`
      }
      
      await exportChart(request)
    } catch (error) {
      console.error('Failed to export chart:', error)
    }
  }

  // Handle exporting slide from visualization
  const handleExportSlide = async (figJson: any, title: string) => {
    try {
      const request: SlideRequest = {
        fig_json: figJson,
        title,
        caption: currentFile?.original_filename,
        filename: `${currentFile?.original_filename.split('.')[0]}_slide.pptx`
      }
      
      await exportSlide(request)
    } catch (error) {
      console.error('Failed to export slide:', error)
    }
  }

  // Handle exporting data
  const handleExportData = async (format: 'csv' | 'excel') => {
    try {
      await exportData(format)
    } catch (error) {
      console.error('Failed to export data:', error)
    }
  }

  return (
    <div className="flex-1 flex flex-col h-screen overflow-hidden">
      {/* Header */}
      <header className="h-16 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 flex items-center justify-between px-4">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="p-2 mr-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            aria-label="Toggle sidebar"
          >
            <Menu size={20} />
          </button>
          <h1 className="text-lg font-medium">
            {currentFile ? currentFile.original_filename : 'No dataset selected'}
          </h1>
          {currentFile && (
            <span className="ml-2 text-sm text-slate-500 dark:text-slate-400">
              ({currentFile.row_count.toLocaleString()} rows, {fileSchema?.columns.length || 0} columns)
            </span>
          )}
        </div>
        
        <div className="flex items-center space-x-2">
          {currentFile && (
            <div className="relative group">
              <button
                className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center"
              >
                <FileDown size={20} className="mr-1" />
                <span>Export</span>
              </button>
              <div className="absolute right-0 z-10 mt-1 w-48 origin-top-right rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none hidden group-hover:block">
                <div className="py-1">
                  <button
                    onClick={() => handleExportData('csv')}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    Export as CSV
                  </button>
                  <button
                    onClick={() => handleExportData('excel')}
                    className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                  >
                    Export as Excel
                  </button>
                </div>
              </div>
            </div>
          )}
          
          {isLlmEnabled && (
            <button
              onClick={toggleChat}
              className="p-2 rounded-md hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label={isChatOpen ? 'Close chat' : 'Open chat'}
            >
              <MessageSquare size={20} />
            </button>
          )}
        </div>
      </header>
      
      {/* Content */}
      <div className="flex-1 flex overflow-hidden">
        <main className="flex-1 overflow-y-auto p-4">
          {currentFile ? (
            <>
              <Tabs
                value={activeTab}
                onChange={(value) => setActiveTab(value as any)}
                variant="default"
              >
                {tabs.map((tab) => (
                  <Tab key={tab.id} value={tab.id}>
                    {tab.label}
                  </Tab>
                ))}
              </Tabs>
              
              <div className="mt-4">
                {activeTab === 'dataset' && filePreview && (
                  <DatasetView
                    schema={fileSchema}
                    preview={filePreview}
                  />
                )}
                
                {activeTab === 'analysis' && currentFile && (
                  <AnalysisView />
                )}
                
                {activeTab === 'visualization' && analysisResult && (
                  <VisualizationView
                    result={analysisResult}
                    onExportChart={handleExportChart}
                    onExportSlide={handleExportSlide}
                  />
                )}
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <h2 className="text-xl font-medium mb-2">No Dataset Selected</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-4">
                  Please upload or select a dataset from the sidebar.
                </p>
              </div>
            </div>
          )}
        </main>
        
        {isLlmEnabled && isChatOpen && (
          <ChatPanel />
        )}
      </div>
    </div>
  )
}

export default MainContent