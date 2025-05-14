import { useState, useEffect } from 'react'
import { useAppStore } from '@/store/appStore'
import Button from '../ui/Button'
import { ChevronDown, ChevronUp, PlayCircle, AlertCircle, Settings } from 'lucide-react'
import { ParameterConfig } from '@/types'

const AnalysisView = () => {
  const {
    currentFile,
    fileSchema,
    currentAnalysis,
    availableMethods,
    analysisParams,
    setAnalysisParams,
    runAnalysis,
    isLoading,
    selectedColumns,
    setSelectedColumns,
  } = useAppStore()

  const [expandedSections, setExpandedSections] = useState({
    parameters: true,
    columns: true,
  })

  // Current method config
  const methodConfig = currentAnalysis && availableMethods ? availableMethods[currentAnalysis] : null

  // Toggle section expansion
  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections({
      ...expandedSections,
      [section]: !expandedSections[section],
    })
  }

  // Handle parameter change
  const handleParamChange = (paramName: string, value: any) => {
    setAnalysisParams({
      ...analysisParams,
      [paramName]: value,
    })
  }

  // Handle column selection
  const handleColumnSelect = (columnName: string) => {
    if (selectedColumns.includes(columnName)) {
      setSelectedColumns(selectedColumns.filter(col => col !== columnName))
    } else {
      setSelectedColumns([...selectedColumns, columnName])
    }
  }

  // Handle "Select All" columns
  const handleSelectAllColumns = () => {
    if (fileSchema) {
      if (selectedColumns.length === fileSchema.columns.length) {
        // Deselect all if all are currently selected
        setSelectedColumns([])
      } else {
        // Select all columns
        setSelectedColumns(fileSchema.columns.map(col => col.name))
      }
    }
  }

  if (!currentAnalysis || !methodConfig) {
    return (
      <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-lg text-center">
        <BarChart className="w-12 h-12 mx-auto mb-4 text-slate-400 dark:text-slate-500" />
        <h3 className="text-lg font-medium mb-2">No Analysis Method Selected</h3>
        <p className="text-slate-600 dark:text-slate-400 mb-4">
          Please select an analysis method from the sidebar to get started.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow border border-slate-200 dark:border-slate-700">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-medium">{methodConfig.name}</h2>
          <p className="text-slate-600 dark:text-slate-400 mt-1">
            {methodConfig.description}
          </p>
        </div>

        {/* Parameters Section */}
        <div>
          <div
            className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750"
            onClick={() => toggleSection('parameters')}
          >
            <div className="flex items-center">
              <Settings size={18} className="mr-2 text-slate-500 dark:text-slate-400" />
              <h3 className="font-medium">Analysis Parameters</h3>
            </div>
            {expandedSections.parameters ? (
              <ChevronUp size={18} className="text-slate-500 dark:text-slate-400" />
            ) : (
              <ChevronDown size={18} className="text-slate-500 dark:text-slate-400" />
            )}
          </div>

          {expandedSections.parameters && (
            <div className="p-4 bg-slate-50 dark:bg-slate-750 space-y-4">
              {Object.entries(methodConfig.parameters).map(([paramName, paramConfig]) => (
                <div key={paramName} className="space-y-1">
                  <label
                    htmlFor={paramName}
                    className="block text-sm font-medium text-slate-700 dark:text-slate-300"
                  >
                    {formatParamName(paramName)}
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">
                    {paramConfig.description}
                  </p>
                  {renderParameterInput(paramName, paramConfig, analysisParams[paramName], handleParamChange)}
                </div>
              ))}
              
              {Object.keys(methodConfig.parameters).length === 0 && (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  No parameters available for this analysis method.
                </p>
              )}
            </div>
          )}
        </div>

        {/* Column Selection Section */}
        <div>
          <div
            className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-750"
            onClick={() => toggleSection('columns')}
          >
            <div className="flex items-center">
              <ListChecks size={18} className="mr-2 text-slate-500 dark:text-slate-400" />
              <h3 className="font-medium">Column Selection</h3>
              <span className="ml-2 text-xs bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-300 px-2 py-0.5 rounded-full">
                {selectedColumns.length} selected
              </span>
            </div>
            {expandedSections.columns ? (
              <ChevronUp size={18} className="text-slate-500 dark:text-slate-400" />
            ) : (
              <ChevronDown size={18} className="text-slate-500 dark:text-slate-400" />
            )}
          </div>

          {expandedSections.columns && fileSchema && (
            <div className="p-4 bg-slate-50 dark:bg-slate-750">
              <div className="mb-2 flex justify-between items-center">
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Select columns to include in the analysis. Leave empty to use all columns.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSelectAllColumns}
                >
                  {selectedColumns.length === fileSchema.columns.length ? 'Deselect All' : 'Select All'}
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 mt-3">
                {fileSchema.columns.map((column) => {
                  const isSelected = selectedColumns.includes(column.name)
                  const isCompatible = methodConfig.supports_numerical || 
                    (!isNumericColumn(column.dtype) && methodConfig.supports_categorical)

                  return (
                    <div 
                      key={column.name}
                      className={`
                        flex items-center p-2 rounded border
                        ${isSelected ? 'bg-primary-50 dark:bg-primary-900/30 border-primary-200 dark:border-primary-800' : 'border-slate-200 dark:border-slate-700'}
                        ${!isCompatible ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800'}
                      `}
                      onClick={() => isCompatible && handleColumnSelect(column.name)}
                    >
                      <input
                        type="checkbox"
                        className="mr-2"
                        checked={isSelected}
                        onChange={() => {}}
                        disabled={!isCompatible}
                      />
                      <div className="overflow-hidden">
                        <div className="font-medium text-sm truncate" title={column.name}>
                          {column.name}
                        </div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center">
                          {column.dtype}
                          {!isCompatible && (
                            <span className="ml-1 text-red-500 dark:text-red-400">
                              (Incompatible)
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {!methodConfig.supports_numerical && fileSchema.columns.every(col => isNumericColumn(col.dtype)) && (
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-md flex items-start">
                  <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    This analysis method doesn't support numerical columns, but your dataset only contains numerical data.
                  </div>
                </div>
              )}

              {!methodConfig.supports_categorical && fileSchema.columns.every(col => !isNumericColumn(col.dtype)) && (
                <div className="mt-4 p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-md flex items-start">
                  <AlertCircle size={16} className="mr-2 mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    This analysis method doesn't support categorical columns, but your dataset only contains categorical data.
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          variant="primary"
          leftIcon={<PlayCircle size={18} />}
          onClick={runAnalysis}
          isLoading={isLoading}
          disabled={
            isLoading || 
            !currentFile || 
            (methodConfig.required_columns?.length && 
              !methodConfig.required_columns.every(col => selectedColumns.includes(col)))
          }
        >
          Run Analysis
        </Button>
      </div>
    </div>
  )
}

// Helper to format parameter names for display
const formatParamName = (name: string): string => {
  return name
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Helper to check if a column is numeric
const isNumericColumn = (dtype: string): boolean => {
  return dtype.includes('int') || dtype.includes('float')
}

// Renders the appropriate input element based on parameter type
const renderParameterInput = (
  paramName: string,
  paramConfig: ParameterConfig,
  value: any,
  onChange: (paramName: string, value: any) => void
) => {
  switch (paramConfig.type) {
    case 'boolean':
      return (
        <div className="flex items-center">
          <input
            id={paramName}
            type="checkbox"
            className="h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
            checked={value ?? paramConfig.default}
            onChange={(e) => onChange(paramName, e.target.checked)}
          />
          <label htmlFor={paramName} className="ml-2 text-sm text-slate-600 dark:text-slate-400">
            {value ? 'Enabled' : 'Disabled'}
          </label>
        </div>
      )

    case 'string':
      if (paramConfig.options) {
        return (
          <select
            id={paramName}
            className="block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:text-sm"
            value={value ?? paramConfig.default}
            onChange={(e) => onChange(paramName, e.target.value)}
          >
            {paramConfig.options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )
      } else {
        return (
          <input
            id={paramName}
            type="text"
            className="block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:text-sm"
            value={value ?? paramConfig.default}
            onChange={(e) => onChange(paramName, e.target.value)}
          />
        )
      }

    case 'integer':
      return (
        <div>
          <input
            id={paramName}
            type="number"
            min={paramConfig.min}
            max={paramConfig.max}
            step={1}
            className="block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:text-sm"
            value={value ?? paramConfig.default}
            onChange={(e) => onChange(paramName, parseInt(e.target.value, 10))}
          />
          {paramConfig.min !== undefined && paramConfig.max !== undefined && (
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span>Min: {paramConfig.min}</span>
              <span>Max: {paramConfig.max}</span>
            </div>
          )}
        </div>
      )

    case 'float':
      return (
        <div>
          <input
            id={paramName}
            type="number"
            min={paramConfig.min}
            max={paramConfig.max}
            step="0.1"
            className="block w-full rounded-md border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 py-2 px-3 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:text-sm"
            value={value ?? paramConfig.default}
            onChange={(e) => onChange(paramName, parseFloat(e.target.value))}
          />
          {paramConfig.min !== undefined && paramConfig.max !== undefined && (
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mt-1">
              <span>Min: {paramConfig.min}</span>
              <span>Max: {paramConfig.max}</span>
            </div>
          )}
        </div>
      )

    default:
      return null
  }
}

// Add this import
import { BarChart, ListChecks } from 'lucide-react'

export default AnalysisView