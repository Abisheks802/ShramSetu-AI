import React from 'react';
import { Globe } from 'lucide-react';

const ChatHeader = ({ welcome, sub, lang, onLangClick }) => (
  <header className="bg-[#0B3C5D] text-white p-5 flex items-center justify-between shrink-0 shadow-lg">
    <div className="flex items-center gap-3">
      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center border border-white/20 text-xl shadow-inner">⚡</div>
      <div className="text-left">
        <h1 className="font-bold text-[15px] tracking-tight leading-none">{welcome}</h1>
        <p className="text-[9px] text-green-300 font-black uppercase tracking-[0.1em] mt-1.5 opacity-80">{sub}</p>
      </div>
    </div>
    <button onClick={onLangClick} className="bg-white/10 px-3 py-1.5 rounded-xl border border-white/20 flex items-center gap-1.5 hover:bg-white/20 transition-all active:scale-95">
      <Globe size={16} className="text-orange-400" />
      <span className="text-[11px] font-bold uppercase tracking-wider">{lang}</span>
    </button>
  </header>
);

export default ChatHeader;