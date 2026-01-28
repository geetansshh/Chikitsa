/**
 * Chat store using Zustand.
 * Manages chatbot conversation state.
 */

import { create } from 'zustand'

interface Message {
  id: number
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
  isLoading?: boolean
}

interface ChatState {
  messages: Message[]
  conversationId: string | null
  isLoading: boolean
  
  // Actions
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void
  setMessages: (messages: Message[]) => void
  setConversationId: (id: string) => void
  setLoading: (loading: boolean) => void
  clearMessages: () => void
  updateLastMessage: (content: string) => void
}

export const useChatStore = create<ChatState>((set) => ({
  messages: [],
  conversationId: null,
  isLoading: false,
  
  addMessage: (message) => set((state) => ({
    messages: [
      ...state.messages,
      {
        ...message,
        id: Date.now(),
        timestamp: new Date(),
      },
    ],
  })),
  
  setMessages: (messages) => set({ messages }),
  
  setConversationId: (id) => set({ conversationId: id }),
  
  setLoading: (loading) => set({ isLoading: loading }),
  
  clearMessages: () => set({ messages: [], conversationId: null }),
  
  updateLastMessage: (content) => set((state) => ({
    messages: state.messages.map((msg, idx) =>
      idx === state.messages.length - 1
        ? { ...msg, content, isLoading: false }
        : msg
    ),
  })),
}))
