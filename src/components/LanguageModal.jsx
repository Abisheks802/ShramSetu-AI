import React from 'react';
import { X } from 'lucide-react';

const LanguageModal = ({ languages, currentLang, onSelect, onClose }) => (
  <div className="absolute inset-0 z-50 bg-black/50 flex items-center justify-center p-6 backdrop-blur-sm">
    <div className="bg-white w-full rounded-[32px] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
      <div className="p-5 border-b flex justify-between items-center bg-white">
        <h3 className="font-bold text-slate-800">Select Language / भाषा चुनें</h3>
        <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={22}/></button>
      </div>
      <div className="p-4 grid grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto">
        {languages.map((l) => (
          <button 
            key={l.code} 
            onClick={() => onSelect(l.code)} 
            className={`flex flex-col items-center justify-center p-4 rounded-2xl border-2 transition-all ${currentLang === l.code ? 'border-green-600 bg-green-50' : 'border-gray-100 hover:border-gray-300 bg-gray-50'}`}
          >
            <span className="font-bold text-lg text-slate-800">{l.native}</span>
            <span className="text-[10px] text-slate-400 font-bold tracking-tighter uppercase">{l.eng}</span>
          </button>
        ))}
      </div>
    </div>
  </div>
);

export default LanguageModal;