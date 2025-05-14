import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { 
  FolderIcon, 
  ChartBarIcon, 
  TableCellsIcon,
  DocumentIcon
} from '@heroicons/react/24/outline';
import axios from 'axios';

const Dashboard = () => {
  const [stats, setStats] = useState({
    files: 0,
    analyses: 0,
    visualizations: 0,
    llmQueries: 0
  });

  // Fetch files count
  const { data: filesData } = useQuery({
    queryKey: ['files'],
    queryFn: async () => {
      // In a real app, this would fetch from the API
      // For demo, return placeholder data
      return { count: 5, recent: [
        { id: 'f1', filename: 'gene_expression.csv', type: 'csv', created_at: '2023-01-15T08:30:00Z' },
        { id: 'f2', filename: 'proteins.fasta', type: 'fasta', created_at: '2023-01-14T11:45:00Z' },
        { id: 'f3', filename: 'variants.vcf', type: 'vcf', created_at: '2023-01-13T15:20:00Z' }
      ]};
    }
  });

  // Fetch analyses count
  const { data: analysesData } = useQuery({
    queryKey: ['analyses'],
    queryFn: async () => {
      // In a real app, this would fetch from the API
      // For demo, return placeholder data
      return { count: 8, recent: [
        { id: 'a1', type: 'clustering', status: 'completed', created_at: '2023-01-15T09:45:00Z' },
        { id: 'a2', type: 'differential_expression', status: 'completed', created_at: '2023-01-14T13:20:00Z' },
        { id: 'a3', type: 'dimensionality_reduction', status: 'running', created_at: '2023-01-15T10:10:00Z' }
      ]};
    }
  });

  // Fetch visualizations count
  const { data: visualizationsData } = useQuery({
    queryKey: ['visualizations'],
    queryFn: async () => {
      // In a real app, this would fetch from the API
      // For demo, return placeholder data
      return { count: 12, recent: [
        { id: 'v1', type: 'heatmap', created_at: '2023-01-15T14:30:00Z' },
        { id: 'v2', type: 'scatter_plot', created_at: '2023-01-15T11:15:00Z' },
        { id: 'v3', type: 'volcano_plot', created_at: '2023-01-14T16:45:00Z' }
      ]};
    }
  });

  // Update stats when data is fetched
  useEffect(() => {
    setStats({
      files: filesData?.count || 0,
      analyses: analysesData?.count || 0,
      visualizations: visualizationsData?.count || 0,
      llmQueries: 6 // Placeholder
    });
  }, [filesData, analysesData, visualizationsData]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Overview of your bioinformatics data and analyses
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="dashboard-card">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-500 rounded-md p-3">
              <DocumentIcon className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Files</div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.files}</div>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-500 rounded-md p-3">
              <TableCellsIcon className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Analyses</div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.analyses}</div>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-purple-500 rounded-md p-3">
              <ChartBarIcon className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Visualizations</div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.visualizations}</div>
            </div>
          </div>
        </div>

        <div className="dashboard-card">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-amber-500 rounded-md p-3">
              <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <div className="ml-4">
              <div className="text-sm font-medium text-gray-500 dark:text-gray-400">LLM Queries</div>
              <div className="text-2xl font-semibold text-gray-900 dark:text-white">{stats.llmQueries}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Files Section */}
      <div className="dashboard-card">
        <div className="dashboard-card-header">Recent Files</div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  File Name
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filesData?.recent.map((file) => (
                <tr key={file.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      to={`/files/${file.id}`}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {file.filename}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="badge-blue">{file.type}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(file.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-center">
          <Link to="/upload" className="btn-primary">
            Upload New File
          </Link>
        </div>
      </div>

      {/* Recent Analyses */}
      <div className="dashboard-card">
        <div className="dashboard-card-header">Recent Analyses</div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {analysesData?.recent.map((analysis) => (
                <tr key={analysis.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link 
                      to={`/analysis/${analysis.id}`}
                      className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {analysis.type.replace('_', ' ')}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`badge-${analysis.status === 'completed' ? 'green' : analysis.status === 'running' ? 'yellow' : 'red'}`}>
                      {analysis.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {new Date(analysis.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-4 flex justify-center">
          <Link to="/analysis" className="btn-primary">
            Create New Analysis
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;