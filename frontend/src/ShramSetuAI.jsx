import React, { useState, useRef, useEffect } from 'react';
import { Shield } from 'lucide-react';
import ChatHeader from './components/ChatHeader';
import ChatInput from './components/ChatInput';
import LanguageModal from './components/LanguageModal';

const ShramSetuAI = () => {
  const [lang, setLang] = useState('en');
  const [isLangOpen, setIsLangOpen] = useState(false);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const [messages, setMessages] = useState(() => {
    const saved = localStorage.getItem('shramsetu_chat_history');
    return saved ? JSON.parse(saved) : [];
  });

  const scrollRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('shramsetu_chat_history', JSON.stringify(messages));
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  const languages = [
    { code: 'en', native: 'English', eng: 'ENGLISH' },
    { code: 'hi', native: 'हिन्दी', eng: 'HINDI' },
    { code: 'bn', native: 'বাংলা', eng: 'BENGALI' },
    { code: 'te', native: 'తెలుగు', eng: 'TELUGU' },
    { code: 'mr', native: 'मराठी', eng: 'MARATHI' }
  ];

  const content = {
    en: { welcome: "ShramSetu AI", sub: "RASA POWERED", placeholder: "Type here...", actions: ["Am I eligible for ESIC?", "Check PF Status"] },
    hi: { welcome: "श्रमसेतु AI", sub: "RASA द्वारा संचालित", placeholder: "यहाँ लिखें...", actions: ["क्या मैं ESIC के पात्र हूँ?", "PF स्टेटस"] }
  };

  const current = content[lang] || content['en'];

  const handleSend = async (text) => {
    const userText = text || input;
    if (!userText.trim()) return;

    // --- SMART FRONTEND VALIDATION ---
    const lowerText = userText.toLowerCase().trim();
    
    // Check if it's a known button/intent or Yes/No (Allowed Alphabets)
    const isAllowedText = 
      lowerText === "yes" || 
      lowerText === "no" || 
      userText.includes("eligible") || 
      userText.includes("Status") || 
      userText.startsWith("/");

    // If it's NOT a button/intent and contains alphabets (Salary Input Case)
    if (!isAllowedText && !/^\d+$/.test(userText.trim())) {
      setMessages(prev => [...prev, 
        { id: Date.now(), text: userText, sender: 'user' },
        { id: Date.now() + 1, text: "Please enter digits only ", sender: 'bot' }
      ]);
      setInput('');
      return; // Stop API call
    }
    // --- VALIDATION END ---

    setMessages(prev => [...prev, { id: Date.now(), text: userText, sender: 'user' }]);
    setInput('');
    setIsTyping(true);

    try {
      const response = await fetch("http://localhost:5005/webhooks/rest/webhook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sender: "user_session_123",
          message: userText
        }),
      });

      const data = await response.json();

      if (data && data.length > 0) {
        data.forEach((res, index) => {
          setTimeout(() => {
            setMessages(prev => [...prev, { 
              id: Date.now() + index, 
              text: res.text || "I didn't quite get that.", 
              sender: 'bot',
              buttons: res.buttons // Store buttons if any
            }]);
            if (index === data.length - 1) setIsTyping(false);
          }, index * 600); 
        });
      } else {
        setIsTyping(false);
      }
    } catch (error) {
      console.error("Rasa Error:", error);
      setIsTyping(false);
      setMessages(prev => [...prev, { 
        id: Date.now() + 999, 
        text: "Error: Cannot connect to Rasa.", 
        sender: 'bot' 
      }]);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-200 sm:bg-[#D1D5DB] flex items-center justify-center font-sans antialiased">
      <div className="w-full h-full sm:w-[420px] sm:h-[90vh] sm:max-h-[850px] bg-white flex flex-col shadow-2xl relative sm:rounded-[32px] overflow-hidden border-x border-gray-100">
        
        {isLangOpen && <LanguageModal languages={languages} currentLang={lang} onSelect={(c) => {setLang(c); setIsLangOpen(false)}} onClose={() => setIsLangOpen(false)} />}

        <ChatHeader welcome={current.welcome} sub={current.sub} lang={lang} onLangClick={() => setIsLangOpen(true)} />

        <main ref={scrollRef} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-white scrollbar-hide">
          <div className="flex justify-center mb-4">
            <div className="bg-slate-50 text-slate-400 px-3 py-1 rounded-full text-[10px] flex items-center gap-2 font-bold border border-slate-100 uppercase tracking-widest shadow-sm">
               <Shield size={12} className="text-orange-500" /> Backend: Rasa Core
            </div>
          </div>
          
          {messages.map((msg) => (
            <div key={msg.id} className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'} animate-in slide-in-from-bottom-1 duration-300`}>
              <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-[14px] leading-relaxed shadow-sm ${msg.sender === 'user' ? 'bg-[#0B3C5D] text-white rounded-tr-none' : 'bg-[#F1F5F9] text-gray-800 rounded-tl-none border border-slate-50'}`}>
                {msg.text}
              </div>

              {/* RENDER INTERACTIVE BUTTONS */}
              {msg.sender === 'bot' && msg.buttons && (
                <div className="flex gap-2 mt-2 flex-wrap">
                  {msg.buttons.map((btn, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(btn.payload)} 
                      className="bg-white border border-[#0B3C5D] text-[#0B3C5D] px-4 py-1.5 rounded-full text-[12px] font-bold hover:bg-[#0B3C5D] hover:text-white transition-all shadow-sm active:scale-95"
                    >
                      {btn.title}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="bg-[#F1F5F9] px-4 py-2.5 rounded-2xl rounded-tl-none border border-slate-50 flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
              </div>
            </div>
          )}
        </main>

        <div className="px-4 py-3 bg-white border-t border-slate-50 overflow-x-auto no-scrollbar">
          <div className="flex gap-2 py-1">
            {current.actions.map((act) => (
              <button 
                key={act} 
                onClick={() => handleSend(act)} 
                className="whitespace-nowrap bg-white px-5 py-2.5 rounded-full text-[12px] font-semibold text-[#0B3C5D] border border-slate-200 shadow-sm hover:border-[#0B3C5D]/30 transition-all active:scale-95"
              >
                {act}
              </button>
            ))}
          </div>
        </div>

        <ChatInput input={input} setInput={setInput} onSend={() => handleSend(input)} placeholder={current.placeholder} />
      </div>
    </div>
  );
};

export default ShramSetuAI;