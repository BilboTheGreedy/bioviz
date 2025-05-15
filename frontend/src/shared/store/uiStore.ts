import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';

import type { ThemeMode } from '@/shared/types';

interface UIState {
  theme: ThemeMode;
  sidebarOpen: boolean;
  chatPanelOpen: boolean;
  commandPaletteOpen: boolean;
  activePage: string;
  activeTab: string;
  actions: {
    setTheme: (theme: ThemeMode) => void;
    toggleSidebar: () => void;
    setSidebarOpen: (open: boolean) => void;
    toggleChatPanel: () => void;
    setChatPanelOpen: (open: boolean) => void;
    toggleCommandPalette: () => void;
    setCommandPaletteOpen: (open: boolean) => void;
    setActivePage: (page: string) => void;
    setActiveTab: (tab: string) => void;
  };
}

export const useUIStore = create<UIState>()(
  persist(
    immer((set) => ({
      theme: 'system',
      sidebarOpen: true,
      chatPanelOpen: false,
      commandPaletteOpen: false,
      activePage: 'home',
      activeTab: 'visualization',
      actions: {
        setTheme: (theme) =>
          set((state) => {
            state.theme = theme;
          }),
        toggleSidebar: () =>
          set((state) => {
            state.sidebarOpen = !state.sidebarOpen;
          }),
        setSidebarOpen: (open) =>
          set((state) => {
            state.sidebarOpen = open;
          }),
        toggleChatPanel: () =>
          set((state) => {
            state.chatPanelOpen = !state.chatPanelOpen;
          }),
        setChatPanelOpen: (open) =>
          set((state) => {
            state.chatPanelOpen = open;
          }),
        toggleCommandPalette: () =>
          set((state) => {
            state.commandPaletteOpen = !state.commandPaletteOpen;
          }),
        setCommandPaletteOpen: (open) =>
          set((state) => {
            state.commandPaletteOpen = open;
          }),
        setActivePage: (page) =>
          set((state) => {
            state.activePage = page;
          }),
        setActiveTab: (tab) =>
          set((state) => {
            state.activeTab = tab;
          }),
      },
    })),
    {
      name: 'bio-viz-llm-ui',
      partialize: (state) => ({ theme: state.theme }),
    }
  )
);