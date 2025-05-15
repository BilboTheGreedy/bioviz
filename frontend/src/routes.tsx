import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';

import { Layout } from '@/shared/components/core/Layout';
import { ErrorPage } from '@/shared/components/core/ErrorPage';
import { LoadingScreen } from '@/shared/components/core/LoadingScreen';

// Lazy-loaded components for code-splitting
const DatasetView = lazy(() => import('@/features/datasets/components/DatasetView').then(m => ({ default: m.DatasetView })));
const AnalysisSelector = lazy(() => import('@/features/analysis/components/AnalysisSelector').then(m => ({ default: m.AnalysisSelector })));
const AnalysisView = lazy(() => import('@/features/analysis/components/AnalysisView').then(m => ({ default: m.AnalysisView })));
const VisualizationView = lazy(() => import('@/features/visualization/components/VisualizationView').then(m => ({ default: m.VisualizationView })));

export const router = createBrowserRouter([
  {
    path: "/",
    element: (
      <Layout>
        <Outlet />
      </Layout>
    ),
    errorElement: <ErrorPage />,
    children: [
      {
        index: true,
        element: <Navigate to="/datasets" replace />,
      },
      {
        path: "datasets",
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <DatasetView />
          </Suspense>
        ),
      },
      {
        path: "analysis",
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <AnalysisSelector />
          </Suspense>
        ),
      },
      {
        path: "analysis/configure",
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <AnalysisView />
          </Suspense>
        ),
      },
      {
        path: "visualization",
        element: (
          <Suspense fallback={<LoadingScreen />}>
            <VisualizationView standalone />
          </Suspense>
        ),
      },
      {
        path: "*",
        element: <ErrorPage />,
      },
    ],
  },
]);