import { useEffect } from 'react'
import { useTheme } from './hooks/useTheme'
import Sidebar from './components/layout/Sidebar'
import MainContent from './components/layout/MainContent'
import { useAppStore } from './store/appStore'

function App() {
  const { theme } = useTheme()
  const { initializeApp } = useAppStore()

  // Initialize app state
  useEffect(() => {
    initializeApp()
  }, [initializeApp])

  // Add dark class to root html element based on theme
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <MainContent />
    </div>
  )
}

export default App