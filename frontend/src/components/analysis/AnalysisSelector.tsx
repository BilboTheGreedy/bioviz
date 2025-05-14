import { AnalysisMethod, MethodConfig } from '@/types'
import { useAppStore } from '@/store/appStore'
import { ChartPie, BarChart, TrendingUp, LineChart, Network, Dices, MessageSquare, Clipboard } from 'lucide-react'

interface AnalysisSelectorProps {
  methods: Record<string, MethodConfig>
  currentMethod: AnalysisMethod | null
}

const AnalysisSelector = ({ methods, currentMethod }: AnalysisSelectorProps) => {
  const { setCurrentAnalysis } = useAppStore()

  // Handle method selection
  const handleSelectMethod = (method: AnalysisMethod) => {
    setCurrentAnalysis(method)
  }

  // Get icon for method
  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'descriptive':
        return <ChartPie size={18} />
      case 'diagnostic':
        return <BarChart size={18} />
      case 'predictive':
        return <TrendingUp size={18} />
      case 'prescriptive':
        return <TrendingUp size={18} />
      case 'time_series':
        return <LineChart size={18} />
      case 'regression':
        return <LineChart size={18} />
      case 'cluster':
        return <Network size={18} />
      case 'factor':
        return <Network size={18} />
      case 'cohort':
        return <BarChart size={18} />
      case 'monte_carlo':
        return <Dices size={18} />
      case 'text_analysis':
        return <MessageSquare size={18} />
      case 'qualitative':
        return <Clipboard size={18} />
      default:
        return <BarChart size={18} />
    }
  }

  return (
    <div className="space-y-2">
      {Object.entries(methods).map(([method, config]) => (
        <div
          key={method}
          className={`p-3 rounded-md cursor-pointer transition-colors ${
            currentMethod === method
              ? 'bg-primary-100 dark:bg-primary-900 dark:bg-opacity-30 border border-primary-200 dark:border-primary-800'
              : 'hover:bg-slate-200 dark:hover:bg-slate-700'
          }`}
          onClick={() => handleSelectMethod(method as AnalysisMethod)}
        >
          <div className="flex items-center space-x-2">
            <div className={`text-slate-600 dark:text-slate-400 ${
              currentMethod === method && 'text-primary-600 dark:text-primary-400'
            }`}>
              {getMethodIcon(method)}
            </div>
            <div>
              <p className={`font-medium text-sm ${
                currentMethod === method && 'text-primary-700 dark:text-primary-300'
              }`}>
                {config.name}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                {config.description}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default AnalysisSelector