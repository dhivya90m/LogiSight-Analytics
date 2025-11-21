import React, { useState, useRef, useEffect } from 'react';
import { DeliveryRecord } from '../types';
import { analyzeDataWithGemini } from '../services/geminiService';
import { Send, Sparkles, Bot, User, Database, Code } from 'lucide-react';

interface AIAnalystProps {
  data: DeliveryRecord[];
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  sql?: string;
}

export const AIAnalyst: React.FC<AIAnalystProps> = ({ data }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hello! I'm your Logistics AI Assistant. Ask me questions like 'Show me the top 5 delayed orders' and I will generate the SQL query for you to validate." }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMsg = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setIsLoading(true);

    const result = await analyzeDataWithGemini(data, userMsg);
    
    setMessages(prev => [...prev, { role: 'assistant', content: result.answer, sql: result.sql }]);
    setIsLoading(false);
  };

  return (
    <div className="h-[600px] bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden animate-fadeIn">
      <div className="p-4 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white flex items-center gap-2">
        <div className="p-2 bg-indigo-100 rounded-lg">
            <Sparkles className="text-indigo-600" size={20} />
        </div>
        <div>
            <h3 className="font-bold text-slate-800">Gemini Insight Engine</h3>
            <p className="text-xs text-slate-500">Natural Language to SQL Generation</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-slate-50" ref={scrollRef}>
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-indigo-600 text-white' : 'bg-emerald-600 text-white'}`}>
                {msg.role === 'user' ? <User size={16}/> : <Bot size={16}/>}
            </div>
            <div className="max-w-[85%] space-y-2">
                <div className={`p-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                    msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none'
                }`}>
                    {msg.content}
                </div>
                {msg.sql && (
                    <div className="bg-slate-900 rounded-lg p-3 border border-slate-700 text-xs font-mono shadow-sm mt-2">
                        <div className="flex items-center gap-2 text-slate-400 mb-2 pb-2 border-b border-slate-700">
                            <Database size={12} /> 
                            <span>Generated SQL for Validation</span>
                        </div>
                        <code className="text-emerald-400 block whitespace-pre-wrap">
                            {msg.sql}
                        </code>
                    </div>
                )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex items-center gap-2 text-slate-400 text-sm p-4">
            <Sparkles size={16} className="animate-spin" /> Generating Analysis & Query...
          </div>
        )}
      </div>

      <div className="p-4 bg-white border-t border-slate-200">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask a question (e.g., 'List orders with >$50 refund in Palo Alto')"
            className="flex-1 p-3 bg-slate-50 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};