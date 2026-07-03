import React, { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Bot, User, BrainCircuit, X } from 'lucide-react';
import { toast } from 'sonner';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
}

export function AdminChatbot() {
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', content: "Hello! I am your AI Admin Assistant. I can help you manage content, answer questions, or perform tasks on your website. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const historyToSend = messages
        .filter(m => m.id !== '1' && m.role !== 'model' || (m.role === 'model' && m.content))
        .slice(-10) // Keep last 10 messages for context
        .map(m => ({ role: m.role, content: m.content }));
        
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: userMsg.content, history: historyToSend })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to get response");
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');
      
      if (!reader) throw new Error("No response body");

      const msgId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: msgId, role: 'model', content: '' }]);

      let done = false;
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          const lines = chunk.split('\\n\\n');
          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const dataStr = line.slice(6);
              if (dataStr === '[DONE]') {
                done = true;
                break;
              }
              try {
                const data = JSON.parse(dataStr);
                if (data.text) {
                  setMessages(prev => prev.map(m => 
                    m.id === msgId ? { ...m, content: m.content + data.text } : m
                  ));
                }
              } catch (e) {
                // Ignore parse errors on incomplete chunks
              }
            }
          }
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to get response");
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'model',
        content: "Sorry, I encountered an error while processing your request."
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden flex flex-col h-[600px]">
      <div className="p-4 border-b border-slate-100 bg-slate-50 flex items-center gap-3">
        <div className="p-2 bg-academic-blue text-white rounded-lg">
          <Bot size={20} />
        </div>
        <div>
          <h2 className="font-bold text-slate-800">AI Admin Assistant</h2>
          <p className="text-xs text-slate-500">Powered by Gemini 2.5 Pro with High Thinking</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
        {messages.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] rounded-2xl p-4 ${msg.role === 'user' ? 'bg-academic-blue text-white rounded-tr-sm' : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm shadow-sm'}`}>
              <div className="whitespace-pre-wrap">{msg.content}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-200 text-slate-500 rounded-2xl rounded-tl-sm p-4 shadow-sm flex items-center gap-2">
              <BrainCircuit size={16} className="animate-pulse text-academic-blue" />
              <span>Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSend} className="p-4 bg-white border-t border-slate-100">
        <div className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask me anything..."
            className="w-full pl-4 pr-12 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-academic-blue focus:border-transparent"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-academic-blue text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 transition-colors"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}
