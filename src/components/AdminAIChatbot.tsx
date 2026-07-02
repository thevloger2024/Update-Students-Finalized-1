import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquare, X, Send, Bot, User, Sparkles, Loader2,
  RefreshCw, ChevronDown, Maximize2, Minimize2, Trash2,
  Lightbulb, Zap
} from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  isStreaming?: boolean;
}

interface ActionBlock {
  type: string;
  data: Record<string, any>;
}

interface AdminAIChatbotProps {
  websiteContext?: Record<string, any>;
  onActionRequest?: (action: ActionBlock) => void;
}

const QUICK_PROMPTS = [
  { icon: '📝', text: 'Latest government jobs post banao', label: 'Create Post' },
  { icon: '📊', text: 'Website ki stats dikhao', label: 'Stats' },
  { icon: '🧩', text: 'SSC CGL ka quiz generate karo', label: 'Quiz' },
  { icon: '🖼️', text: 'Railway Recruitment ke liye thumbnail banao', label: 'Thumbnail' },
  { icon: '🔍', text: 'Recent errors dikhao website ke', label: 'Errors' },
  { icon: '🌐', text: 'Trending government jobs topics dhundho', label: 'Trends' },
];

function parseActionBlock(content: string): { cleanContent: string; action: ActionBlock | null } {
  const actionMatch = content.match(/```action\n([\s\S]*?)\n```/);
  if (!actionMatch) return { cleanContent: content, action: null };
  try {
    const action = JSON.parse(actionMatch[1]);
    const cleanContent = content.replace(/```action\n[\s\S]*?\n```/, '').trim();
    return { cleanContent, action };
  } catch {
    return { cleanContent: content, action: null };
  }
}

function MarkdownText({ text }: { text: string }) {
  const formatted = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code style="background:#f1f5f9;padding:1px 4px;border-radius:3px;font-size:0.85em">$1</code>')
    .replace(/^### (.*$)/gm, '<h3 style="font-size:1em;font-weight:700;margin:8px 0 4px;color:#1e3a5f">$1</h3>')
    .replace(/^## (.*$)/gm, '<h3 style="font-size:1.1em;font-weight:700;margin:10px 0 4px;color:#1e3a5f">$1</h3>')
    .replace(/^# (.*$)/gm, '<h2 style="font-size:1.2em;font-weight:800;margin:10px 0 4px;color:#1e3a5f">$1</h2>')
    .replace(/^- (.*$)/gm, '<li style="margin-left:16px;list-style:disc;margin-bottom:3px">$1</li>')
    .replace(/^(\d+)\. (.*$)/gm, '<li style="margin-left:16px;list-style:decimal;margin-bottom:3px">$2</li>')
    .replace(/\n\n/g, '<br/><br/>')
    .replace(/\n/g, '<br/>');
  return <div dangerouslySetInnerHTML={{ __html: formatted }} style={{ lineHeight: 1.6 }} />;
}

export function AdminAIChatbot({ websiteContext = {}, onActionRequest }: AdminAIChatbotProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      role: 'assistant',
      content: `Namaste! 🙏 Main aapka **AI Admin Assistant** hoon.\n\nMain ye kaam kar sakta hoon:\n- 📝 **Posts create/edit/delete** karna\n- 🧩 **Quiz generate** karna\n- 🖼️ **Thumbnails** banana\n- 📊 **Stats** dikhana\n- 🌐 **Trending topics** dhundhna\n- 🚨 **Errors** monitor karna\n\nAap mujhse Hindi ya English mein baat kar sakte hain. Kya madad chahiye? 😊`,
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen) {
      setUnreadCount(0);
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    };

    const assistantMessage: Message = {
      id: `assistant_${Date.now()}`,
      role: 'assistant',
      content: '',
      timestamp: new Date(),
      isStreaming: true,
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setInput('');
    setIsLoading(true);

    // Build conversation history (last 10 messages)
    const conversationHistory = messages.slice(-10).map(m => ({
      role: m.role,
      content: m.content,
    }));

    abortControllerRef.current = new AbortController();

    try {
      const response = await fetch('/api/gemini/admin-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text.trim(),
          conversationHistory,
          websiteContext,
        }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6).trim();
              if (dataStr === '[DONE]') break;
              try {
                const data = JSON.parse(dataStr);
                if (data.text) {
                  fullText += data.text;
                  setMessages(prev =>
                    prev.map(m =>
                      m.id === assistantMessage.id
                        ? { ...m, content: fullText, isStreaming: true }
                        : m
                    )
                  );
                } else if (data.error) {
                  throw new Error(data.error);
                }
              } catch (parseErr) {
                // skip malformed chunks
              }
            }
          }
        }
      }

      // Parse action blocks from final response
      const { cleanContent, action } = parseActionBlock(fullText);

      setMessages(prev =>
        prev.map(m =>
          m.id === assistantMessage.id
            ? { ...m, content: cleanContent, isStreaming: false }
            : m
        )
      );

      if (action && onActionRequest) {
        onActionRequest(action);
        toast.info(`🤖 AI action requested: ${action.type}`, { duration: 3000 });
      }

      if (!isOpen) setUnreadCount(prev => prev + 1);
    } catch (error: any) {
      if (error.name === 'AbortError') {
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantMessage.id
              ? { ...m, content: m.content + '\n\n*[Response cancelled]*', isStreaming: false }
              : m
          )
        );
      } else {
        setMessages(prev =>
          prev.map(m =>
            m.id === assistantMessage.id
              ? { ...m, content: `❌ Error: ${error.message || 'Something went wrong. Please try again.'}`, isStreaming: false }
              : m
          )
        );
        toast.error('AI response failed');
      }
    } finally {
      setIsLoading(false);
      abortControllerRef.current = null;
    }
  }, [isLoading, messages, websiteContext, onActionRequest, isOpen]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const clearHistory = () => {
    setMessages([{
      id: 'welcome_new',
      role: 'assistant',
      content: 'Conversation clear ho gayi! Main phir se ready hoon. Kya madad chahiye? 😊',
      timestamp: new Date(),
    }]);
  };

  const stopGeneration = () => {
    abortControllerRef.current?.abort();
  };

  const chatWidth = isMaximized ? 'w-[700px]' : 'w-[380px]';
  const chatHeight = isMaximized ? 'h-[85vh]' : 'h-[600px]';

  return (
    <>
      {/* ── FLOATING BUTTON ────────────────────────────────── */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
        <AnimatePresence>
          {!isOpen && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 10 }}
              className="bg-white rounded-2xl shadow-xl border border-slate-100 px-4 py-2.5 flex items-center gap-2 cursor-pointer hover:shadow-2xl transition-all"
              onClick={() => setIsOpen(true)}
            >
              <Zap className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-bold text-slate-700">AI Assistant</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={() => setIsOpen(v => !v)}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-14 h-14 rounded-full shadow-2xl flex items-center justify-center text-white transition-all"
          style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 50%, #7c3aed 100%)' }}
          title="AI Admin Assistant"
        >
          <AnimatePresence mode="wait">
            {isOpen ? (
              <motion.div key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }}>
                <X className="w-6 h-6" />
              </motion.div>
            ) : (
              <motion.div key="open" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }}>
                <Bot className="w-6 h-6" />
              </motion.div>
            )}
          </AnimatePresence>

          {unreadCount > 0 && !isOpen && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </motion.span>
          )}
          
          {/* Pulse ring */}
          <span className="absolute inset-0 rounded-full animate-ping opacity-20" style={{ background: 'linear-gradient(135deg, #1e3a5f, #2563eb)' }} />
        </motion.button>
      </div>

      {/* ── CHAT WINDOW ────────────────────────────────────── */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20, x: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 300 }}
            className={`fixed bottom-24 right-6 z-50 ${chatWidth} ${chatHeight} flex flex-col rounded-3xl shadow-2xl overflow-hidden border border-slate-200`}
            style={{ background: 'linear-gradient(180deg, #f8faff 0%, #ffffff 100%)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100"
              style={{ background: 'linear-gradient(135deg, #1e3a5f 0%, #2563eb 100%)' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                  <Bot className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm leading-tight">AI Admin Assistant</p>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                    <p className="text-white/70 text-xs">High Thinking • Online</p>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={clearHistory} title="Clear chat"
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-all text-white/70 hover:text-white">
                  <Trash2 className="w-4 h-4" />
                </button>
                <button onClick={() => setIsMaximized(v => !v)} title={isMaximized ? 'Minimize' : 'Maximize'}
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-all text-white/70 hover:text-white">
                  {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>
                <button onClick={() => setIsOpen(false)} title="Close"
                  className="p-1.5 rounded-lg hover:bg-white/20 transition-all text-white/70 hover:text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4" style={{ scrollbarWidth: 'thin' }}>
              {messages.map(msg => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-2.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full flex-shrink-0 flex items-center justify-center mt-0.5"
                      style={{ background: 'linear-gradient(135deg, #1e3a5f, #2563eb)' }}>
                      <Bot className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'text-white rounded-tr-sm'
                      : 'bg-white text-slate-700 rounded-tl-sm border border-slate-100 shadow-sm'
                  }`}
                    style={msg.role === 'user' ? { background: 'linear-gradient(135deg, #1e3a5f, #2563eb)' } : {}}>
                    {msg.role === 'assistant' ? (
                      <>
                        <MarkdownText text={msg.content} />
                        {msg.isStreaming && (
                          <span className="inline-block w-1.5 h-4 bg-blue-500 rounded animate-pulse ml-1 align-middle" />
                        )}
                      </>
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                    <p className={`text-xs mt-1.5 ${msg.role === 'user' ? 'text-white/50' : 'text-slate-400'}`}>
                      {msg.timestamp.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-full flex-shrink-0 bg-slate-200 flex items-center justify-center mt-0.5">
                      <User className="w-4 h-4 text-slate-600" />
                    </div>
                  )}
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Prompts (only show when no conversation yet) */}
            {messages.length <= 1 && (
              <div className="px-4 pb-2">
                <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                  <Lightbulb className="w-3 h-3" /> Quick actions:
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {QUICK_PROMPTS.map(qp => (
                    <button
                      key={qp.label}
                      onClick={() => sendMessage(qp.text)}
                      className="text-xs px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-600 transition-all font-medium border border-slate-200 hover:border-blue-200"
                    >
                      {qp.icon} {qp.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Input Area */}
            <div className="px-4 pb-4 pt-2 border-t border-slate-100">
              <div className="flex gap-2 items-end bg-white rounded-2xl border border-slate-200 shadow-sm p-2 focus-within:border-blue-400 focus-within:shadow-md transition-all">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Admin ko kuch pucho ya task dijiye... (Enter = send)"
                  rows={1}
                  className="flex-1 resize-none outline-none text-sm text-slate-700 placeholder-slate-400 bg-transparent px-1 max-h-32"
                  style={{ scrollbarWidth: 'none' }}
                  disabled={isLoading}
                />
                <div className="flex gap-1 flex-shrink-0">
                  {isLoading && (
                    <button
                      onClick={stopGeneration}
                      title="Stop generation"
                      className="p-2 rounded-xl text-red-400 hover:bg-red-50 transition-all"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => sendMessage(input)}
                    disabled={!input.trim() || isLoading}
                    className="p-2 rounded-xl text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                    style={{ background: (!input.trim() || isLoading) ? '#cbd5e1' : 'linear-gradient(135deg, #1e3a5f, #2563eb)' }}
                    title="Send (Enter)"
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
              <p className="text-center text-xs text-slate-400 mt-2">
                <Sparkles className="w-3 h-3 inline mr-1 text-purple-400" />
                Powered by Gemini 2.5 Flash with High Thinking
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
