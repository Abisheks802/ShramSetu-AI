import React from 'react';
import { Send, Mic } from 'lucide-react';

const ChatInput = ({ input, setInput, onSend, placeholder }) => (
  <footer className="p-3 sm:p-5 bg-white border-t border-slate-100 shrink-0">
    <div className="flex items-center gap-2 bg-[#F1F5F9] rounded-[20px] px-3 sm:px-4 py-1 focus-within:ring-2 focus-within:ring-[#0B3C5D]/10 transition-all">
      <Mic size={18} className="text-slate-400 cursor-pointer hover:text-green-600 transition-colors shrink-0" />
      <input 
        type="text" 
        value={input} 
        onChange={(e) => setInput(e.target.value)} 
        onKeyDown={(e) => e.key === 'Enter' && onSend()} 
        placeholder={placeholder} 
        className="flex-1 bg-transparent border-none focus:outline-none text-[14px] py-3 text-slate-700 font-medium" 
      />
      <button 
        onClick={onSend} 
        disabled={!input.trim()}
        className={`p-2 rounded-xl transition-all shrink-0 ${input.trim() ? 'text-[#0B3C5D] scale-105' : 'text-slate-300'}`}
      >
        <Send size={20} fill={input.trim() ? "currentColor" : "none"} />
      </button>
    </div>
  </footer>
);

export default ChatInput;