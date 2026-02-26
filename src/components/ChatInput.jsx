import React from 'react';
import { Send, Mic } from 'lucide-react';

const ChatInput = ({ input, setInput, onSend, placeholder }) => (
  <footer className="p-5 bg-white border-t border-slate-100 shrink-0">
    <div className="flex items-center gap-2 bg-[#F1F5F9] rounded-2xl px-4 py-1.5 focus-within:ring-2 focus-within:ring-[#0B3C5D]/10 transition-all">
      <Mic size={20} className="text-slate-400 cursor-pointer hover:text-green-600 transition-colors" />
      <input 
        type="text" 
        value={input} 
        onChange={(e) => setInput(e.target.value)} 
        onKeyDown={(e) => e.key === 'Enter' && onSend()} 
        placeholder={placeholder} 
        className="flex-1 bg-transparent border-none focus:outline-none text-[14px] py-3 text-slate-700 font-medium" 
      />
      <button onClick={onSend} className={`p-2 rounded-xl transition-all ${input.trim() ? 'text-[#0B3C5D] scale-110' : 'text-slate-300'}`}>
        <Send size={22} fill={input.trim() ? "currentColor" : "none"} />
      </button>
    </div>
  </footer>
);

export default ChatInput;