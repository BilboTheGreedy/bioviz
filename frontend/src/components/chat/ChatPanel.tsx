import { useState, useRef, useEffect } from 'react'
import { useAppStore } from '@/store/appStore'
import { X, Send, Edit, Copy, Check, Play } from 'lucide-react'
import Button from '../ui/Button'
import CodeMirror from '@uiw/react-codemirror'
import { python } from '@codemirror/lang-python'
import { githubLight, githubDark } from '@uiw/codemirror-theme-github'
import { useTheme } from '@/hooks/useTheme'
import ReactMarkdown from 'react-markdown'
import { motion, AnimatePresence } from 'framer-motion'
import Plot from 'react-plotly.js'

const ChatPanel = () => {
  const [query, setQuery] = useState('')
  const [executing, setExecuting] = useState(false)
  const [editingCode, setEditingCode] = useState<{ code: string; index: number } | null>(null)
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null)
  
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()
  
  const {
    chatHistory,
    submitLlmQuery,
    executeCode,
    toggleChat,
    isLoading,
  } = useAppStore()
  
  // Scroll to bottom when chat history changes
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' })
    }
  }, [chatHistory])
  
  // Reset copied state after 2 seconds
  useEffect(() => {
    if (copiedIndex !== null) {
      const timer = setTimeout(() => {
        setCopiedIndex(null)
      }, 2000)
      
      return () => clearTimeout(timer)
    }
  }, [copiedIndex])
  
  // Handle query submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!query.trim() || isLoading) return
    
    const userQuery = query
    setQuery('')
    
    try {
      await submitLlmQuery(userQuery)
    } catch (error) {
      console.error('Error submitting query:', error)
    }
  }
  
  // Handle code execution
  const handleExecuteCode = async (code: string) => {
    setExecuting(true)
    
    try {
      const result = await executeCode(code)
      
      // Add result to chat history if needed (this would require modifying the store)
      console.log('Code execution result:', result)
    } catch (error) {
      console.error('Error executing code:', error)
    } finally {
      setExecuting(false)
      setEditingCode(null)
    }
  }
  
  // Handle code editing
  const handleEditCode = (code: string, index: number) => {
    setEditingCode({ code, index })
  }
  
  // Handle copying code to clipboard
  const handleCopyCode = (code: string, index: number) => {
    navigator.clipboard.writeText(code)
    setCopiedIndex(index)
  }
  
  // Extract code blocks from message content
  const getCodeBlocks = (content: string) => {
    const codeBlockRegex = /```(?:python)?\s*([\s\S]*?)```/g
    const codeBlocks: string[] = []
    
    let match
    while ((match = codeBlockRegex.exec(content)) !== null) {
      codeBlocks.push(match[1].trim())
    }
    
    return codeBlocks
  }
  
  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 300, opacity: 0 }}
      className="w-96 border-l border-slate-200 dark:border-slate-700 h-full flex flex-col bg-white dark:bg-slate-800"
    >
      <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
        <h2 className="font-medium">Chat with Data</h2>
        <button
          onClick={toggleChat}
          className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
          aria-label="Close chat"
        >
          <X size={18} />
        </button>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {chatHistory.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
              <h3 className="font-medium mb-2">Ask Questions About Your Data</h3>
              <p className="text-sm mb-4">
                Use natural language to analyze your dataset, create visualizations, and gain insights.
              </p>
              <div className="space-y-2 text-sm">
                <p className="p-2 bg-slate-100 dark:bg-slate-700 rounded cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors" 
                   onClick={() => setQuery("What is the correlation between columns?")}>
                  What is the correlation between columns?
                </p>
                <p className="p-2 bg-slate-100 dark:bg-slate-700 rounded cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                   onClick={() => setQuery("Create a scatter plot of the first two numeric columns")}>
                  Create a scatter plot of the first two numeric columns
                </p>
                <p className="p-2 bg-slate-100 dark:bg-slate-700 rounded cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                   onClick={() => setQuery("What are the top 5 rows with the highest values in column A?")}>
                  What are the top 5 rows with the highest values in column A?
                </p>
              </div>
            </div>
          </div>
        ) : (
          <>
            {chatHistory.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-3/4 rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary-600 text-white'
                      : message.role === 'system'
                      ? 'bg-red-100 dark:bg-red-900 dark:bg-opacity-30 text-red-800 dark:text-red-300'
                      : 'bg-slate-100 dark:bg-slate-700'
                  }`}
                >
                  {message.role === 'assistant' ? (
                    <>
                      <div className="prose dark:prose-invert prose-sm max-w-none">
                        <ReactMarkdown
                          components={{
                            // Remove code blocks as we'll handle them separately
                            code: ({ node, inline, ...props }) => {
                              if (inline) {
                                return <code {...props} />
                              }
                              return null
                            }
                          }}
                        >
                          {message.content.replace(/```[\s\S]*?```/g, '')}
                        </ReactMarkdown>
                      </div>
                      
                      {/* Code blocks */}
                      {getCodeBlocks(message.content).map((code, codeIndex) => (
                        <div 
                          key={codeIndex}
                          className="mt-3 bg-slate-200 dark:bg-slate-800 rounded-md overflow-hidden"
                        >
                          {editingCode && editingCode.index === index && editingCode.code === code ? (
                            <div>
                              <div className="p-2 bg-slate-300 dark:bg-slate-900 flex justify-between items-center text-xs">
                                <span className="font-medium">Edit Code</span>
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() => setEditingCode(null)}
                                    className="p-1 hover:bg-slate-400 dark:hover:bg-slate-700 rounded"
                                    aria-label="Cancel"
                                  >
                                    <X size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleExecuteCode(editingCode.code)}
                                    className="p-1 bg-primary-500 hover:bg-primary-600 text-white rounded flex items-center"
                                    disabled={executing}
                                  >
                                    <Play size={14} className="mr-1" />
                                    Run
                                  </button>
                                </div>
                              </div>
                              <div className="p-0">
                                <CodeMirror
                                  value={editingCode.code}
                                  height="200px"
                                  extensions={[python()]}
                                  theme={theme === 'dark' ? githubDark : githubLight}
                                  onChange={(value) => setEditingCode({ code: value, index })}
                                />
                              </div>
                            </div>
                          ) : (
                            <div>
                              <div className="p-2 bg-slate-300 dark:bg-slate-900 flex justify-between items-center text-xs">
                                <span className="font-medium">Python</span>
                                <div className="flex space-x-1">
                                  <button
                                    onClick={() => handleCopyCode(code, index)}
                                    className="p-1 hover:bg-slate-400 dark:hover:bg-slate-700 rounded flex items-center"
                                  >
                                    {copiedIndex === index ? (
                                      <Check size={14} className="text-green-500" />
                                    ) : (
                                      <Copy size={14} />
                                    )}
                                  </button>
                                  <button
                                    onClick={() => handleEditCode(code, index)}
                                    className="p-1 hover:bg-slate-400 dark:hover:bg-slate-700 rounded"
                                  >
                                    <Edit size={14} />
                                  </button>
                                  <button
                                    onClick={() => handleExecuteCode(code)}
                                    className="p-1 hover:bg-slate-400 dark:hover:bg-slate-700 rounded"
                                  >
                                    <Play size={14} />
                                  </button>
                                </div>
                              </div>
                              <pre className="p-3 text-xs font-mono overflow-x-auto">
                                {code}
                              </pre>
                            </div>
                          )}
                        </div>
                      ))}
                    </>
                  ) : (
                    <p>{message.content}</p>
                  )}
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>
      
      <form onSubmit={handleSubmit} className="p-3 border-t border-slate-200 dark:border-slate-700">
        <div className="flex items-center">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Ask a question about your data..."
            className="flex-1 px-3 py-2 rounded-l-md border border-slate-300 dark:border-slate-600 focus:outline-none focus:ring-2 focus:ring-primary-500 dark:focus:ring-primary-400 focus:border-transparent bg-white dark:bg-slate-700"
            disabled={isLoading}
          />
          <Button
            type="submit"
            variant="primary"
            className="rounded-l-none"
            isLoading={isLoading}
            disabled={!query.trim() || isLoading}
          >
            <Send size={18} />
          </Button>
        </div>
      </form>
    </motion.div>
  )
}

export default ChatPanel