import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, Mic, ArrowLeft, MoreHorizontal } from 'lucide-react';
import { STRINGS } from '../constants';
import { Language, ChatMessage } from '../types';
import { useNotifications } from '../context/NotificationContext';
import { useAppContext } from '../context/AppContext';
import api from '../services/api';

interface ChatAssistantProps {
  language: Language;
  onBack: () => void;
  initialMessage?: string;
}

export default function ChatAssistant({ language, onBack, initialMessage }: ChatAssistantProps) {
  const { addNotification } = useNotifications();
  const { user } = useAppContext();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'ai',
      text: STRINGS[language].chatInitial.replace('{name}', user?.name || 'Guest'),
      timestamp: new Date(),
      suggestions: [
        STRINGS[language].whyMyDataFinish,
        STRINGS[language].showCheaper,
      ],
    },
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const t = STRINGS[language];

  useEffect(() => {
    if (initialMessage && initialMessage !== '') {
      handleSend(initialMessage);
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await api.post('/chat/message', {
        message: text,
        language
      });
      
      const { text: aiResponseText, suggestions: aiSuggestions } = response.data;
      
      // Check if we should trigger a notification
      const lowerText = text.toLowerCase();
      if (lowerText.includes('plan') || lowerText.includes('switch') || lowerText.includes('save')) {
        addNotification({
          type: 'plan_update',
          title: 'Plan Analysis Ready',
          message: `Your request about "${text.substring(0, 30)}..." has been processed.`,
          action: 'chat',
        });
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: aiResponseText,
        timestamp: new Date(),
        suggestions: aiSuggestions,
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        text: "I'm having trouble connecting to my servers right now. Please try again later.",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative pb-20 md:pb-0">
      {/* Header */}
      <header className="px-4 py-3 bg-white border-b border-slate-100 flex items-center justify-between z-10 md:py-6 md:px-8">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
            <ArrowLeft className="w-5 h-5 text-mtn-blue" />
          </button>
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-mtn-yellow flex items-center justify-center border-2 border-white shadow-sm overflow-hidden">
                <AssistantAvatar />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
            </div>
            <div>
              <h3 className="font-black text-sm text-mtn-blue">ClarityAI</h3>
              <p className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Active Now</p>
            </div>
          </div>
        </div>
         <button className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
           <MoreHorizontal className="w-5 h-5 text-slate-400 hover:text-mtn-blue transition-colors" />
         </button>
      </header>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        <AnimatePresence>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex flex-col gap-2 max-w-[85%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div
                  className={`px-5 py-4 rounded-3xl shadow-sm relative group/msg ${
                    msg.role === 'user'
                      ? 'bg-mtn-blue text-white rounded-tr-none'
                      : 'bg-white text-mtn-blue rounded-tl-none border border-slate-100'
                  }`}
                >
                  <p className="text-sm font-medium leading-relaxed mb-1">{msg.text}</p>
                  <div className={`text-[9px] font-bold opacity-40 flex justify-end`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {msg.suggestions && msg.role === 'ai' && (
                  <div className="flex flex-wrap gap-2 mt-1">
                    {msg.suggestions.map((s) => (
                      <button
                        key={s}
                        onClick={() => handleSend(s)}
                        className="px-3 py-1.5 bg-mtn-yellow/10 border border-mtn-yellow/20 rounded-full text-xs font-bold text-mtn-blue hover:bg-mtn-yellow/20 transition-all"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-white border border-slate-100 px-5 py-3 rounded-3xl rounded-tl-none shadow-sm flex gap-1">
              <span className="w-1.5 h-1.5 bg-mtn-yellow rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-mtn-yellow rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-mtn-yellow rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-slate-100 pb-8">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend(input);
          }}
          className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-100 focus-within:border-mtn-yellow focus-within:bg-white transition-all shadow-inner"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t.placeholder}
            className="flex-1 bg-transparent px-2 py-2 outline-none text-sm font-medium text-mtn-blue placeholder:text-slate-400"
          />
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="p-3 text-slate-400 hover:text-mtn-blue transition-colors rounded-xl hover:bg-slate-50"
            >
              <Mic className="w-5 h-5" />
            </button>
            <button
              type="submit"
              disabled={!input.trim()}
              className="p-3 bg-mtn-yellow text-mtn-blue rounded-xl shadow-lg shadow-mtn-yellow/20 disabled:opacity-50 disabled:shadow-none translate-x-0 active:scale-95 transition-all hover:bg-mtn-yellow/90"
            >
              <Send className="w-5 h-5 fill-mtn-blue" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function AssistantAvatar() {
  return (
    <svg viewBox="0 0 100 100" className="w-8 h-8">
      <defs>
        <linearGradient id="avatarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{ stopColor: '#0066CC' }} />
          <stop offset="100%" style={{ stopColor: '#003366' }} />
        </linearGradient>
      </defs>
      <circle cx="50" cy="50" r="48" fill="url(#avatarGrad)" />
      <path d="M30 50 L45 35 L70 50 L55 65 Z" fill="white" fillOpacity="0.2" />
      <circle cx="50" cy="50" r="15" fill="#FFCB05" />
      <path d="M40 50 L50 40 L60 50 L50 60 Z" fill="white" fillOpacity="0.9" />
      <motion.circle 
        cx="50" cy="50" r="25" 
        stroke="white" strokeWidth="0.5" fill="none"
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
        transition={{ duration: 3, repeat: Infinity }}
      />
    </svg>
  );
}
