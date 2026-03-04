/**
 * AI Chat page with conversation interface.
 */

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useMutation } from '@tanstack/react-query'
import { format } from 'date-fns'
import { chatbotAPI } from '@/lib/api'
import { useChatStore } from '@/stores/chatStore'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import usePageTitle from '@/hooks/usePageTitle'
import {
  PaperAirplaneIcon,
  SparklesIcon,
  UserCircleIcon,
  ArrowPathIcon,
  LightBulbIcon,
  HeartIcon,
  BeakerIcon,
  ExclamationTriangleIcon,
} from '@heroicons/react/24/outline'

const quickActions = [
  { icon: LightBulbIcon, text: 'General health tips', color: 'bg-yellow-100 text-yellow-600' },
  { icon: HeartIcon, text: 'Heart health advice', color: 'bg-red-100 text-red-600' },
  { icon: BeakerIcon, text: 'Medicine information', color: 'bg-purple-100 text-purple-600' },
  { icon: ExclamationTriangleIcon, text: 'Symptom checker', color: 'bg-orange-100 text-orange-600' },
]

export default function Chat() {
  usePageTitle('AI Health Assistant')
  const [input, setInput] = useState('')
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const {
    messages,
    conversationId,
    isLoading,
    addMessage,
    setConversationId,
    setLoading,
    updateLastMessage,
    clearMessages,
  } = useChatStore()
  
  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])
  
  // Send message mutation
  const sendMessage = useMutation({
    mutationFn: (message: string) =>
      chatbotAPI.sendMessage(message, conversationId || undefined),
    onSuccess: (response) => {
      const data = response.data
      setConversationId(data.conversation_id)
      updateLastMessage(data.content)  // Backend returns 'content', not 'response'
    },
    onError: () => {
      updateLastMessage(
        'Sorry, I encountered an error. Please try again.'
      )
    },
    onSettled: () => {
      setLoading(false)
    },
  })
  
  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    
    const message = input.trim()
    setInput('')
    
    // Add user message
    addMessage({ role: 'user', content: message })
    
    // Add loading message
    addMessage({ role: 'assistant', content: '', isLoading: true })
    setLoading(true)
    
    // Send to API
    sendMessage.mutate(message)
  }
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }
  
  const handleQuickAction = (text: string) => {
    setInput(text)
    inputRef.current?.focus()
  }
  
  return (
    <div className="h-[calc(100vh-4.5rem)] flex flex-col overflow-hidden">
      <div className="container mx-auto px-2 sm:px-4 py-2 sm:py-4 flex-1 flex flex-col max-w-4xl overflow-hidden">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-4"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 gradient-bg rounded-full flex items-center justify-center">
              <SparklesIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                Chikitsa AI Assistant
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Your personal health companion
              </p>
            </div>
          </div>
          
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearMessages}
              leftIcon={<ArrowPathIcon className="w-4 h-4" />}
            >
              New Chat
            </Button>
          )}
        </motion.div>
        
        {/* Chat Area */}
        <Card
          variant="bordered"
          padding="none"
          className="flex-1 flex flex-col overflow-hidden"
        >
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="h-full flex flex-col items-center justify-center text-center p-8"
              >
                <div className="w-20 h-20 gradient-bg rounded-full flex items-center justify-center mb-4">
                  <SparklesIcon className="w-10 h-10 text-white" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  How can I help you today?
                </h2>
                <p className="text-gray-500 dark:text-gray-400 mb-8 max-w-md">
                  I can answer health questions, analyze symptoms, provide
                  medication information, and offer wellness tips.
                </p>
                
                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md w-full px-2 sm:px-0">
                  {quickActions.map((action, index) => (
                    <motion.button
                      key={action.text}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      onClick={() => handleQuickAction(action.text)}
                      className="flex items-center gap-3 p-4 rounded-xl bg-white/40 dark:bg-slate-800/40 backdrop-blur-lg border border-white/40 dark:border-slate-700 hover:bg-white/60 dark:hover:bg-slate-700/60 transition-all text-left shadow-sm"
                    >
                      <div className={`w-10 h-10 rounded-lg ${action.color} flex items-center justify-center`}>
                        <action.icon className="w-5 h-5" />
                      </div>
                      <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {action.text}
                      </span>
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            ) : (
              <AnimatePresence initial={false}>
                {messages.map((message) => (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className={`flex gap-3 ${
                      message.role === 'user' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      {message.role === 'user' ? (
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-slate-600 flex items-center justify-center">
                          <UserCircleIcon className="w-5 h-5 text-gray-500 dark:text-gray-300" />
                        </div>
                      ) : (
                        <div className="w-8 h-8 rounded-full gradient-bg flex items-center justify-center">
                          <SparklesIcon className="w-4 h-4 text-white" />
                        </div>
                      )}
                    </div>
                    
                    {/* Message */}
                    <div
                      className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-3 sm:px-4 py-2.5 sm:py-3 ${
                        message.role === 'user'
                          ? 'bg-primary-500 text-white rounded-tr-none'
                          : 'bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg border border-white/40 dark:border-slate-700 text-gray-800 dark:text-gray-200 rounded-tl-none shadow-sm'
                      }`}
                    >
                      {message.isLoading ? (
                        <div className="flex gap-1.5">
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                          <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                        </div>
                      ) : (
                        <>
                          <p className="whitespace-pre-wrap">{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.role === 'user'
                                ? 'text-primary-200'
                                : 'text-gray-400'
                            }`}
                          >
                            {format(new Date(message.timestamp), 'h:mm a')}
                          </p>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Disclaimer */}
          <div className="px-4 py-2 bg-yellow-50 dark:bg-yellow-500/10 border-t border-yellow-100 dark:border-yellow-500/20">
            <p className="text-xs text-yellow-700 dark:text-yellow-300 text-center">
              ⚠️ This AI provides general health information only. Always
              consult a qualified healthcare professional for medical advice.
            </p>
          </div>
          
          {/* Input */}
          <div className="p-2 sm:p-4 border-t dark:border-slate-700 bg-white/60 dark:bg-slate-800/60 backdrop-blur-xl">
            <div className="flex gap-2 sm:gap-3">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your health question..."
                className="flex-1 px-3 sm:px-4 py-2.5 sm:py-3 border border-gray-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none text-sm sm:text-base dark:bg-slate-700 dark:text-white"
                disabled={isLoading}
              />
              <Button
                onClick={handleSend}
                disabled={!input.trim() || isLoading}
                className="px-3 sm:px-6"
                rightIcon={<PaperAirplaneIcon className="w-5 h-5" />}
              >
                <span className="hidden sm:inline">Send</span>
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
