import { useState } from 'react'
import { AnalysisResponse, VisualizationData } from '@/types'
import { Tabs, Tab } from '@/components/ui/Tabs'
import { BarChart2, Save, Download, PresentationIcon, Maximize, Share } from 'lucide-react'
import Button from '../ui/Button'
import Plot from 'react-plotly.js'

interface VisualizationViewProps {
  result: AnalysisResponse
  onExportChart: (figJson: any, format: 'png' | 'svg') => void
  onExportSlide: (figJson: any, title: string) => void
}

const VisualizationView = ({ result, onExportChart, onExportSlide }: VisualizationViewProps) => {
  const [activeViz, setActiveViz] = useState<number>(0)
  const [fullscreen, setFullscreen] = useState<boolean>(false)

  const visualizations = result.result.visualizations
  const currentViz = visualizations[activeViz]
  
  // If there are no visualizations, show a message
  if (!visualizations || visualizations.length === 0) {
    return (
      <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
        <BarChart2 className="w-12 h-12 mx-auto mb-4 text-slate-400 dark:text-slate-500" />
        <h3 className="text-lg font-medium mb-2">No Visualizations Available</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          The selected analysis method did not generate any visualizations.
        </p>
      </div>
    )
  }
  
  // Handle export actions
  const handleExportPNG = () => {
    onExportChart(currentViz.data, 'png')
  }
  
  const handleExportSVG = () => {
    onExportChart(currentViz.data, 'svg')
  }
  
  const handleExportSlide = () => {
    // Get the title from the layout if available
    const title = currentViz.layout.title?.text || 'Analysis Result'
    onExportSlide(currentViz.data, title)
  }
  
  // Handle fullscreen toggle
  const handleFullscreenToggle = () => {
    setFullscreen(!fullscreen)
  }

  return (
    <div className={`${fullscreen ? 'fixed inset-0 z-50 bg-white dark:bg-slate-900 p-4' : ''}`}>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-medium">Analysis Results</h2>
        
        <div className="flex space-x-2">
          <div className="relative group">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Download size={16} />}
            >
              Export
            </Button>
            <div className="absolute right-0 z-10 mt-1 w-48 origin-top-right rounded-md bg-white dark:bg-slate-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none hidden group-hover:block">
              <div className="py-1">
                <button
                  onClick={handleExportPNG}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Export as PNG
                </button>
                <button
                  onClick={handleExportSVG}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Export as SVG
                </button>
                <button
                  onClick={handleExportSlide}
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  Export to PowerPoint
                </button>
              </div>
            </div>
          </div>
          
          <Button
            variant="outline"
            size="sm"
            leftIcon={<Maximize size={16} />}
            onClick={handleFullscreenToggle}
          >
            {fullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          </Button>
        </div>
      </div>
      
      {/* Visualization tabs */}
      {visualizations.length > 1 && (
        <Tabs
          value={activeViz.toString()}
          onChange={(value) => setActiveViz(parseInt(value, 10))}
          variant="pills"
          className="mb-4"
        >
          {visualizations.map((viz, index) => (
            <Tab key={index} value={index.toString()}>
              {getTabLabel(viz, index)}
            </Tab>
          ))}
        </Tabs>
      )}
      
      {/* Visualization */}
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 p-4">
        <div className="h-[500px] w-full">
          <Plot
            data={currentViz.data}
            layout={{
              ...currentViz.layout,
              autosize: true,
              font: {
                family: 'Inter, system-ui, sans-serif',
                color: document.documentElement.classList.contains('dark') ? '#e2e8f0' : '#1e293b',
              },
              paper_bgcolor: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
              plot_bgcolor: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
              margin: { t: 60, r: 30, b: 60, l: 60 },
            }}
            config={{
              responsive: true,
              displayModeBar: true,
              displaylogo: false,
              modeBarButtonsToRemove: [
                'sendDataToCloud',
                'editInChartStudio',
                'lasso2d',
                'select2d',
              ],
              ...(currentViz.config || {}),
            }}
            className="w-full h-full"
          />
        </div>
      </div>
      
      {/* Summary Information */}
      {result.result.summary && (
        <div className="mt-6">
          <h3 className="text-md font-medium mb-3">Analysis Summary</h3>
          <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 p-4">
            <SummaryDisplay summary={result.result.summary} />
          </div>
        </div>
      )}
      
      {/* Tables */}
      {result.result.tables && result.result.tables.length > 0 && (
        <div className="mt-6">
          <h3 className="text-md font-medium mb-3">Data Tables</h3>
          <div className="space-y-6">
            {result.result.tables.map((table, index) => (
              <div
                key={index}
                className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                <div className="border-b border-slate-200 dark:border-slate-700 p-3">
                  <h4 className="font-medium">{table.title || table.name || `Table ${index + 1}`}</h4>
                </div>
                <div className="p-4 overflow-x-auto">
                  <TableDisplay table={table} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      
      {/* Analysis Metadata */}
      <div className="mt-6 text-sm text-slate-500 dark:text-slate-400">
        <p>Analysis performed in {result.execution_time.toFixed(2)} seconds</p>
        <p>Method: {result.request.method}</p>
      </div>
    </div>
  )
}

// Helper to get tab label for visualization
const getTabLabel = (viz: VisualizationData, index: number): string => {
  // Try to get the title from the layout
  const title = viz.layout?.title?.text
  
  // If no title, use the visualization type and index
  if (!title) {
    return `${viz.type.charAt(0).toUpperCase() + viz.type.slice(1)} ${index + 1}`
  }
  
  // If title is too long, truncate it
  return title.length > 20 ? title.slice(0, 18) + '...' : title
}

// Component to display analysis summary
const SummaryDisplay = ({ summary }: { summary: Record<string, any> }) => {
  // Recursively render summary objects
  const renderSummaryItem = (key: string, value: any): JSX.Element => {
    if (value === null || value === undefined) {
      return <span className="text-slate-400 dark:text-slate-500">null</span>
    }
    
    if (typeof value === 'object' && !Array.isArray(value)) {
      return (
        <div className="pl-4 border-l-2 border-slate-200 dark:border-slate-700 mt-2">
          {Object.entries(value).map(([nestedKey, nestedValue]) => (
            <div key={nestedKey} className="mt-2">
              <span className="font-medium">{formatKey(nestedKey)}:</span>{' '}
              {renderSummaryItem(nestedKey, nestedValue)}
            </div>
          ))}
        </div>
      )
    }
    
    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-slate-400 dark:text-slate-500">[]</span>
      }
      
      if (typeof value[0] === 'object') {
        return (
          <div className="mt-2 overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
              <thead>
                <tr>
                  {Object.keys(value[0]).map((columnKey) => (
                    <th
                      key={columnKey}
                      className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
                    >
                      {formatKey(columnKey)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
                {value.slice(0, 10).map((item, i) => (
                  <tr key={i}>
                    {Object.values(item).map((cellValue: any, j) => (
                      <td key={j} className="px-3 py-2 text-sm">
                        {typeof cellValue === 'object'
                          ? JSON.stringify(cellValue)
                          : String(cellValue)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
            {value.length > 10 && (
              <div className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                Showing 10 of {value.length} items
              </div>
            )}
          </div>
        )
      }
      
      return (
        <span>
          [{value.slice(0, 5).map(String).join(', ')}
          {value.length > 5 ? `, ... (${value.length - 5} more)` : ''}]
        </span>
      )
    }
    
    return <span>{String(value)}</span>
  }
  
  // Some keys should be excluded from display
  const excludedKeys = ['dataset_info']
  const filteredSummary = Object.entries(summary).filter(([key]) => !excludedKeys.includes(key))
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Dataset info if available */}
      {summary.dataset_info && (
        <div className="bg-slate-50 dark:bg-slate-750 p-3 rounded">
          <h4 className="font-medium mb-2">Dataset Information</h4>
          <div className="text-sm">
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              <div>Rows:</div>
              <div className="font-medium">{summary.dataset_info.row_count.toLocaleString()}</div>
              
              <div>Columns:</div>
              <div className="font-medium">{summary.dataset_info.column_count}</div>
              
              <div>Numeric Columns:</div>
              <div className="font-medium">{summary.dataset_info.numeric_columns}</div>
              
              <div>Categorical Columns:</div>
              <div className="font-medium">{summary.dataset_info.categorical_columns}</div>
              
              <div>Memory Usage:</div>
              <div className="font-medium">{summary.dataset_info.memory_usage}</div>
            </div>
          </div>
        </div>
      )}
      
      {/* Other summary items */}
      {filteredSummary.map(([key, value]) => (
        <div key={key} className="bg-slate-50 dark:bg-slate-750 p-3 rounded">
          <h4 className="font-medium mb-2">{formatKey(key)}</h4>
          <div className="text-sm">{renderSummaryItem(key, value)}</div>
        </div>
      ))}
    </div>
  )
}

// Component to display a data table
const TableDisplay = ({ table }: { table: any }) => {
  if (!table.data || table.data.length === 0) {
    return <p className="text-slate-500 dark:text-slate-400">No data available</p>
  }
  
  return (
    <div>
      <table className="min-w-full divide-y divide-slate-200 dark:divide-slate-700">
        <thead>
          <tr className="bg-slate-100 dark:bg-slate-800">
            {table.columns.map((column: string) => (
              <th
                key={column}
                className="px-3 py-2 text-left text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider"
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
          {table.data.slice(0, 20).map((row: any, i: number) => (
            <tr key={i} className="even:bg-slate-50 dark:even:bg-slate-800/50">
              {table.columns.map((column: string) => (
                <td key={column} className="px-3 py-2 text-sm">
                  {formatCellValue(row[column])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {table.total_rows > 20 && (
        <div className="text-sm text-slate-500 dark:text-slate-400 mt-3">
          Showing 20 of {table.total_rows.toLocaleString()} rows
        </div>
      )}
    </div>
  )
}

// Helper to format keys for display
const formatKey = (key: string): string => {
  return key
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Helper to format cell values for display
const formatCellValue = (value: any): string => {
  if (value === null || value === undefined) {
    return '<null>'
  }
  
  if (typeof value === 'object') {
    try {
      return JSON.stringify(value)
    } catch {
      return String(value)
    }
  }
  
  if (typeof value === 'number') {
    // Format numbers with appropriate precision
    return Math.abs(value) < 0.001 && value !== 0
      ? value.toExponential(2)
      : value.toLocaleString(undefined, {
          maximumFractionDigits: 4,
        })
  }
  
  return String(value)
}

export default VisualizationView