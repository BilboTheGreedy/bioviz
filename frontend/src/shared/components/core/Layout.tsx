import { Suspense, ReactNode } from 'react';
import { Toaster } from 'sonner';

import { ErrorBoundary } from './ErrorBoundary';
import { LoadingScreen } from './LoadingScreen';
import { AppBar } from './AppBar';
import { Sidebar } from './Sidebar';
import { MainContent } from './MainContent';
import { CommandPalette } from './CommandPalette';
import { useUIStore } from '@/shared/store/uiStore';

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { chatPanelOpen } = useUIStore((state) => ({
    chatPanelOpen: state.chatPanelOpen,
  }));

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ErrorBoundary>
        <AppBar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <Suspense fallback={<LoadingScreen />}>
            <MainContent>{children}</MainContent>
          </Suspense>
          {chatPanelOpen && <div id="chat-panel-root" />}
        </div>
        <CommandPalette />
      </ErrorBoundary>
      <Toaster position="top-right" />
    </div>
  );
}