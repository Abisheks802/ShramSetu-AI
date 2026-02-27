import React, { useState, useRef, useEffect } from 'react';
import { Shield } from 'lucide-react';
import ChatHeader from './components/ChatHeader';
import ChatInput from './components/ChatInput';
import LanguageModal from './components/LanguageModal';

const ShramSetuAI = () => {
  // --- States with LocalStorage recovery ---
  const [lang, setLang] = useState('en');
  const [isLangOpen, setIsLangOpen] = useState(false);
  
  const [messages, setMessages] = useState(() => {
    const savedMessages = localStorage.getItem('shramsetu_chat_history');
    return savedMessages ? JSON.parse(savedMessages) : [];
  });

  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  
  const [currentFlow, setCurrentFlow] = useState(() => {
    return localStorage.getItem('shramsetu_current_flow') || null;
  });

  const [userSalary, setUserSalary] = useState(() => {
    const savedSalary = localStorage.getItem('shramsetu_salary');
    return savedSalary ? JSON.parse(savedSalary) : null;
  });

  const scrollRef = useRef(null);

  // --- Handlers ---
  const handleReset = () => {
    if (window.confirm("Kya aap puri chat delete karna chahte hain?")) {
      localStorage.clear();
      setMessages([]);
      setCurrentFlow(null);
      setUserSalary(null);
    }
  };

  const languages = [
    { code: 'en', native: 'English', eng: 'ENGLISH' },
    { code: 'hi', native: 'हिन्दी', eng: 'HINDI' },
    { code: 'bn', native: 'বাংলা', eng: 'BENGALI' },
    { code: 'te', native: 'తెలుగు', eng: 'TELUGU' },
    { code: 'mr', native: 'मराठी', eng: 'MARATHI' },
    { code: 'ta', native: 'தமிழ்', eng: 'TAMIL' },
    { code: 'gu', native: 'ગુજરાતી', eng: 'GUJARATI' },
    { code: 'kn', native: 'ಕನ್ನಡ', eng: 'KANNADA' },
    { code: 'ml', native: 'മലയാളം', eng: 'MALAYALAM' },
    { code: 'pa', native: 'ਪੰਜਾਬੀ', eng: 'PUNJABI' }
  ];

  const content = {
    en: { welcome: "ShramSetu AI", sub: "LABOR ASSISTANT", placeholder: "Type here...", actions: ["Am I eligible for ESIC?", "Check PF Status"], askReg: "Is your employer registered under ESIC?", askSalary: "Monthly Salary (₹)?", askPwD: "Are you PwD?", yesNo: ["Yes", "No"] },
    hi: { welcome: "श्रमसेतु AI", sub: "श्रम सहायक", placeholder: "यहाँ लिखें...", actions: ["क्या मैं ESIC के पात्र हूँ?", "PF स्टेटस"], askReg: "क्या आपका एम्प्लॉयर रजिस्टर्ड है?", askSalary: "मासिक सैलरी (₹)?", askPwD: "क्या आप दिव्यांग हैं?", yesNo: ["हाँ", "नहीं"] }
  };

  const current = content[lang] || content['en'];

  // --- Sync States to LocalStorage ---
  useEffect(() => {
    localStorage.setItem('shramsetu_chat_history', JSON.stringify(messages));
    localStorage.setItem('shramsetu_current_flow', currentFlow || "");
    localStorage.setItem('shramsetu_salary', JSON.stringify(userSalary));
  }, [messages, currentFlow, userSalary]);

  // --- Auto Scroll ---
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

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
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error("API Failure");

      setTimeout(() => {
        let botReply = "";
        let nextFlow = currentFlow;
        const foundSalary = extractSalary(userText);

        if (userText.toLowerCase().includes("esic") || userText.includes("पात्र")) {
          botReply = current.askReg;
          nextFlow = "AWAITING_REGISTRATION";
        } else if (currentFlow === "AWAITING_REGISTRATION") {
          const isReg = userText.toLowerCase().includes("yes") || userText.includes("हाँ") || userText.includes("हो");
          if (isReg) {
            botReply = current.askSalary;
            nextFlow = "AWAITING_SALARY";
          } else {
            botReply = "Employer not registered. Draft complaint: 'Check ESIC registration'.";
            nextFlow = null;
          }
        } else if (currentFlow === "AWAITING_SALARY" || (foundSalary && !currentFlow)) {
          if (foundSalary) {
            setUserSalary(foundSalary);
            botReply = current.askPwD;
            nextFlow = "AWAITING_PWD";
          } else { botReply = "Please enter salary in digits."; }
        } else if (currentFlow === "AWAITING_PWD") {
          const isPwD = userText.toLowerCase().includes("yes") || userText.includes("हाँ") || userText.includes("हो");
          const limit = isPwD ? 25000 : 21000;
          botReply = userSalary <= limit ? " Eligible! Benefits: Medical, Sickness." : " Not Eligible. Salary exceeds limit.";
          nextFlow = null;
        } else {
          botReply = "How can I help you today?";
        }

        setMessages(prev => [...prev, { id: Date.now() + 1, text: botReply, sender: 'bot' }]);
        setCurrentFlow(nextFlow);
        setIsTyping(false);
      }, 1000);

    } catch (error) {
      console.error("Error:", error);
      setTimeout(() => {
        setMessages(prev => [...prev, { id: Date.now() + 2, text: "Something went wrong. Please try again.", sender: 'bot' }]);
        setIsTyping(false);
      }, 1000);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#D1D5DB] flex items-center justify-center font-sans">
      <div className="w-full max-w-[420px] h-full sm:h-[90vh] bg-[#F8FAFC] flex flex-col shadow-2xl relative sm:rounded-[40px] overflow-hidden border border-gray-300">
        
        {isLangOpen && (
          <LanguageModal 
            languages={languages} 
            currentLang={lang} 
            onSelect={(code) => { setLang(code); setIsLangOpen(false); }} 
            onClose={() => setIsLangOpen(false)} 
          />
        )}

        {/* Header sirf ek baar upar aayega */}
        <ChatHeader 
          welcome={current.welcome} 
          sub={current.sub} 
          lang={lang} 
          onLangClick={() => setIsLangOpen(true)} 
          onReset={handleReset} 
        />

        <main ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4 bg-white scrollbar-hide">
          <div className="flex justify-center mb-6">
            <div className="bg-slate-50 text-slate-400 px-4 py-1.5 rounded-full text-[10px] flex items-center gap-2 font-bold border border-slate-100 uppercase tracking-widest shadow-sm">
               <Shield size={12} className="text-orange-500" /> Secure Encryption
            </div>
          </div>
          
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-2 duration-300`}>
              <div className={`max-w-[85%] p-3.5 rounded-2xl text-[14px] ${msg.sender === 'user' ? 'bg-[#0B3C5D] text-white rounded-tr-none' : 'bg-[#F1F5F9] text-gray-800 rounded-tl-none border'}`}>
                {msg.text}
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start animate-in fade-in duration-300">
              <div className="bg-[#F1F5F9] p-4 rounded-2xl rounded-tl-none border border-slate-100 flex gap-1 items-center shadow-sm">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
              </div>
            </div>
          )}
        </main>

        <div className="px-5 py-3 bg-white border-t overflow-x-auto no-scrollbar">
          <div className="flex gap-2.5">
            {(currentFlow === "AWAITING_REGISTRATION" || currentFlow === "AWAITING_PWD" ? current.yesNo : current.actions).map((act) => (
              <button key={act} onClick={() => handleSend(act)} className="whitespace-nowrap bg-white px-5 py-2.5 rounded-full text-[12px] font-bold text-[#0B3C5D] border border-slate-200 shadow-sm active:scale-95 transition-all">
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