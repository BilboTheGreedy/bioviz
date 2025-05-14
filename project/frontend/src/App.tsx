import { Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import FileUpload from './pages/FileUpload';
import AnalysisPage from './pages/AnalysisPage';
import VisualizationPage from './pages/VisualizationPage';
import FileDetail from './pages/FileDetail';
import LLMPage from './pages/LLMPage';
import NotFound from './pages/NotFound';
import Layout from './components/Layout';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="upload" element={<FileUpload />} />
        <Route path="files/:fileId" element={<FileDetail />} />
        <Route path="analysis" element={<AnalysisPage />} />
        <Route path="analysis/:analysisId" element={<AnalysisPage />} />
        <Route path="visualization" element={<VisualizationPage />} />
        <Route path="visualization/:visualizationId" element={<VisualizationPage />} />
        <Route path="llm" element={<LLMPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

export default App;