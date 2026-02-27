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
  
  const [currentFlow, setCurrentFlow] = useState(() => localStorage.getItem('shramsetu_current_flow') || null);
  const [userSalary, setUserSalary] = useState(() => {
    const saved = localStorage.getItem('shramsetu_salary');
    return saved ? JSON.parse(saved) : null;
  });

  const scrollRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('shramsetu_chat_history', JSON.stringify(messages));
    localStorage.setItem('shramsetu_current_flow', currentFlow || "");
    localStorage.setItem('shramsetu_salary', JSON.stringify(userSalary));
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, currentFlow, userSalary]);

  const languages = [
    { code: 'en', native: 'English', eng: 'ENGLISH' },
    { code: 'hi', native: 'हिन्दी', eng: 'HINDI' },
    { code: 'bn', native: 'বাংলা', eng: 'BENGALI' },
    { code: 'te', native: 'తెలుగు', eng: 'TELUGU' },
    { code: 'mr', native: 'मराठी', eng: 'MARATHI' }
  ];

  const content = {
    en: { 
        welcome: "ShramSetu AI", sub: "LABOR ASSISTANT", placeholder: "Type here...", 
        actions: ["Am I eligible for ESIC?", "Check PF Status"], 
        askReg: "Is your employer registered under ESIC?", 
        askSalary: "Monthly Salary (₹)?", 
        askPwD: "Are you PwD (Disabled)?", 
        yesNo: ["Yes", "No"],
        errDigits: "Please provide your monthly salary in digits (e.g., 15000).",
        errYesNo: "Please reply with 'Yes' or 'No'."
    },
    hi: { 
        welcome: "श्रमसेtu AI", sub: "श्रम सहायक", placeholder: "यहाँ लिखें...", 
        actions: ["क्या मैं ESIC के पात्र हूँ?", "PF स्टेटस"], 
        askReg: "क्या आपका एम्प्लॉयर रजिस्टर्ड है?", 
        askSalary: "मासिक सैलरी (₹)?", 
        askPwD: "क्या आप दिव्यांग हैं?", 
        yesNo: ["हाँ", "नहीं"],
        errDigits: "कृपया अपनी मासिक सैलरी अंकों (digits) में बताएं (जैसे: 15000)।",
        errYesNo: "कृपया 'हाँ' या 'नहीं' में जवाब दें।"
    }
  };

  const current = content[lang] || content['en'];

  const extractSalary = (text) => {
    const match = text.match(/\d+/g);
    return match ? parseInt(match.join('')) : null;
  };

  const handleSend = async (text) => {
    const userText = text || input;
    if (!userText.trim()) return;

    setMessages(prev => [...prev, { id: Date.now(), text: userText, sender: 'user' }]);
    setInput('');
    setIsTyping(true);

    try {
      const API_URL = "https://699fd9dc3188b0b1d536f164.mockapi.io/esic";
      await fetch(API_URL); 

      setTimeout(() => {
        let botReply = "";
        let nextFlow = currentFlow;
        const foundSalary = extractSalary(userText);

        const isYes = (t) => t.toLowerCase().includes("yes") || t.includes("हाँ") || t.includes("हो");
        const isNo = (t) => t.toLowerCase().includes("no") || t.includes("नहीं");
       
        const isAskingEligibility = userText.toLowerCase().includes("eligible") || userText.includes("पात्र") || userText.toLowerCase().includes("esic");

  
        if (isAskingEligibility && currentFlow !== "AWAITING_REGISTRATION") {
          botReply = current.askReg;
          nextFlow = "AWAITING_REGISTRATION";
        } 
        // Registration Logic
        else if (currentFlow === "AWAITING_REGISTRATION") {
          if (isYes(userText)) {
            botReply = current.askSalary;
            nextFlow = "AWAITING_SALARY";
          } else if (isNo(userText)) {
            botReply = lang === 'hi' ? "क्षमा करें, ESIC के लिए एम्प्लॉयर का रजिस्टर्ड होना अनिवार्य है।" : "Sorry, employer registration is mandatory for ESIC.";
            nextFlow = null;
          } else {
            botReply = current.errYesNo;
          }
        } 
        // Salary Validation
        else if (currentFlow === "AWAITING_SALARY") {
          if (foundSalary !== null && foundSalary > 0) {
            setUserSalary(foundSalary);
            botReply = current.askPwD;
            nextFlow = "AWAITING_PWD";
          } else {
            botReply = current.errDigits;
            nextFlow = "AWAITING_SALARY";
          }
        } 
        // PwD Logic
        else if (currentFlow === "AWAITING_PWD") {
          if (isYes(userText) || isNo(userText)) {
            const limit = isYes(userText) ? 25000 : 21000;
            if (userSalary <= limit) {
              botReply = lang === 'hi' ? `आप पात्र हैं! (Limit: ₹${limit})` : ` You are eligible! (Limit: ₹${limit})`;
            } else {
              botReply = lang === 'hi' ? `आप पात्र नहीं हैं। सैलरी ₹${limit} से अधिक है।` : `Not eligible. Salary exceeds ₹${limit}.`;
            }
            nextFlow = null;
          } else {
            botReply = current.errYesNo;
          }
        } 
        else {
          botReply = lang === 'hi' ? "मैं आपकी और क्या सहायता कर सकता हूँ?" : "How else can I help you today?";
          nextFlow = null;
        }

        setMessages(prev => [...prev, { id: Date.now() + 1, text: botReply, sender: 'bot' }]);
        setCurrentFlow(nextFlow);
        setIsTyping(false);
      }, 1000);

    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now() + 2, text: "Connection error.", sender: 'bot' }]);
      setIsTyping(false);
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
               <Shield size={12} className="text-orange-500" /> Secure Encryption
            </div>
          </div>
          
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-1 duration-300`}>
              <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-[14px] leading-relaxed shadow-sm ${msg.sender === 'user' ? 'bg-[#0B3C5D] text-white rounded-tr-none' : 'bg-[#F1F5F9] text-gray-800 rounded-tl-none border border-slate-50'}`}>
                {msg.text}
              </div>
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
            {(currentFlow === "AWAITING_REGISTRATION" || currentFlow === "AWAITING_PWD" ? current.yesNo : current.actions).map((act) => (
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