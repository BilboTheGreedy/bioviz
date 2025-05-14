import { useState, useMemo } from 'react'
import { SchemaInfo, DatasetPreview, ColumnInfo } from '@/types'
import { Tabs, Tab } from '@/components/ui/Tabs'
import { ChevronLeft, ChevronRight, AlertCircle, Info } from 'lucide-react'
import { useAppStore } from '@/store/appStore'
import Button from '../ui/Button'

interface DatasetViewProps {
  schema: SchemaInfo | null
  preview: DatasetPreview | null
}

const DatasetView = ({ schema, preview }: DatasetViewProps) => {
  const [tab, setTab] = useState('data')
  const { currentFile, loadFilePreview } = useAppStore()
  
  // Pagination state
  const [page, setPage] = useState(0)
  const pageSize = 100
  
  // Handle page change
  const handlePageChange = async (newPage: number) => {
    if (!currentFile) return
    
    setPage(newPage)
    await loadFilePreview(currentFile.file_id, newPage * pageSize, pageSize)
  }
  
  // Compute pagination information
  const pagination = useMemo(() => {
    if (!preview) return null
    
    const start = preview.start_index + 1
    const end = preview.start_index + preview.displayed_rows
    const total = preview.total_rows
    const currentPage = Math.floor(preview.start_index / pageSize)
    const totalPages = Math.ceil(preview.total_rows / pageSize)
    
    return { start, end, total, currentPage, totalPages }
  }, [preview, pageSize])
  
  if (!schema || !preview) {
    return (
      <div className="p-4 text-center">
        <p>No dataset information available.</p>
      </div>
    )
  }
  
  return (
    <div>
      <Tabs value={tab} onChange={setTab} variant="pills" className="mb-4">
        <Tab value="data">Data Preview</Tab>
        <Tab value="schema">Schema Information</Tab>
        <Tab value="stats">Column Statistics</Tab>
      </Tabs>
      
      {tab === 'data' && (
        <div>
          <div className="mb-4 overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800">
                  <th className="border border-slate-300 dark:border-slate-700 px-3 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Row
                  </th>
                  {schema.columns.map((column) => (
                    <th 
                      key={column.name}
                      className="border border-slate-300 dark:border-slate-700 px-3 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider"
                    >
                      {column.name}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {preview.data.map((row, index) => (
                  <tr 
                    key={index}
                    className="even:bg-slate-50 dark:even:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <td className="border border-slate-300 dark:border-slate-700 px-3 py-1 text-sm text-slate-500 dark:text-slate-400">
                      {preview.start_index + index + 1}
                    </td>
                    {schema.columns.map((column) => (
                      <td 
                        key={column.name}
                        className="border border-slate-300 dark:border-slate-700 px-3 py-1 text-sm"
                      >
                        {formatCellValue(row[column.name])}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {pagination && (
            <div className="flex items-center justify-between py-2">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Showing rows {pagination.start} to {pagination.end} of {pagination.total.toLocaleString()}
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 0}
                  leftIcon={<ChevronLeft size={16} />}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {pagination.currentPage + 1} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={!preview.has_more}
                  rightIcon={<ChevronRight size={16} />}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {tab === 'schema' && (
        <div>
          <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 flex">
            <Info className="w-5 h-5 text-blue-500 dark:text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-medium text-blue-700 dark:text-blue-300 mb-1">Dataset Information</h3>
              <p className="text-sm text-blue-600 dark:text-blue-400">
                {schema.row_count.toLocaleString()} rows • {schema.columns.length} columns • {schema.memory_usage} in memory • {schema.file_size} on disk
              </p>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-100 dark:bg-slate-800">
                  <th className="border border-slate-300 dark:border-slate-700 px-3 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Column Name
                  </th>
                  <th className="border border-slate-300 dark:border-slate-700 px-3 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Data Type
                  </th>
                  <th className="border border-slate-300 dark:border-slate-700 px-3 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Unique Values
                  </th>
                  <th className="border border-slate-300 dark:border-slate-700 px-3 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Missing Values
                  </th>
                  <th className="border border-slate-300 dark:border-slate-700 px-3 py-2 text-left text-xs font-medium text-slate-600 dark:text-slate-300 uppercase tracking-wider">
                    Sample Values
                  </th>
                </tr>
              </thead>
              <tbody>
                {schema.columns.map((column) => (
                  <tr 
                    key={column.name}
                    className="even:bg-slate-50 dark:even:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <td className="border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm font-medium">
                      {column.name}
                    </td>
                    <td className="border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm">
                      <span className="px-2 py-1 rounded bg-slate-200 dark:bg-slate-700 text-xs font-mono">
                        {column.dtype}
                      </span>
                    </td>
                    <td className="border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm">
                      {column.unique_values !== undefined ? column.unique_values.toLocaleString() : 'N/A'}
                    </td>
                    <td className="border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm">
                      {column.missing_count !== undefined ? (
                        <div>
                          <span className="font-medium">{column.missing_count.toLocaleString()}</span>
                          <span className="text-slate-500 dark:text-slate-400 ml-1">
                            ({column.missing_percentage?.toFixed(1)}%)
                          </span>
                        </div>
                      ) : 'N/A'}
                    </td>
                    <td className="border border-slate-300 dark:border-slate-700 px-3 py-2 text-sm">
                      {column.sample_values?.length ? (
                        <div className="flex flex-wrap gap-1">
                          {column.sample_values.map((value, i) => (
                            <span 
                              key={i}
                              className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-xs"
                            >
                              {formatCellValue(value)}
                            </span>
                          ))}
                        </div>
                      ) : 'No samples available'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {tab === 'stats' && (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {schema.columns.map((column) => (
              <ColumnCard key={column.name} column={column} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

const ColumnCard = ({ column }: { column: ColumnInfo }) => {
  const isNumeric = column.dtype.includes('int') || column.dtype.includes('float')
  
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 border border-slate-200 dark:border-slate-700">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-medium text-sm truncate" title={column.name}>
          {column.name}
        </h3>
        <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-700 text-xs font-mono">
          {column.dtype}
        </span>
      </div>
      
      <div className="space-y-2 text-sm">
        {isNumeric && (
          <>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Min:</span>
              <span className="font-mono">{column.min_value}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Max:</span>
              <span className="font-mono">{column.max_value}</span>
            </div>
          </>
        )}
        
        <div className="flex justify-between">
          <span className="text-slate-500 dark:text-slate-400">Unique values:</span>
          <span>{column.unique_values?.toLocaleString() || 'N/A'}</span>
        </div>
        
        <div className="flex justify-between">
          <span className="text-slate-500 dark:text-slate-400">Missing values:</span>
          <span>
            {column.missing_count?.toLocaleString() || 0}
            {column.missing_percentage !== undefined && column.missing_percentage > 0 && (
              <span className="text-slate-400 dark:text-slate-500 ml-1">
                ({column.missing_percentage.toFixed(1)}%)
              </span>
            )}
          </span>
        </div>
        
        {column.nullable && column.missing_percentage && column.missing_percentage > 20 && (
          <div className="flex items-center text-amber-600 dark:text-amber-400 text-xs mt-1 p-1 bg-amber-50 dark:bg-amber-900/20 rounded">
            <AlertCircle size={12} className="mr-1 flex-shrink-0" />
            <span>High percentage of missing values</span>
          </div>
        )}
      </div>
    </div>
  )
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
  
  return String(value)
}

export default DatasetView