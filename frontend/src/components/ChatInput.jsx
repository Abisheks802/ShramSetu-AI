 import React, { useState, useEffect } from 'react';
import { Send, Mic } from 'lucide-react';

const ChatInput = ({ input, setInput, onSend, placeholder }) => {
  const [isListening, setIsListening] = useState(false);
  const [recognition, setRecognition] = useState(null);

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      const recog = new SpeechRecognition();
      recog.continuous = false;
      recog.lang = "en-IN";
      recog.interimResults = false;

      recog.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recog.onerror = () => {
        setIsListening(false);
      };

      setRecognition(recog);
    }
  }, []);

  const handleMicClick = () => {
    if (!recognition) {
      alert("Speech recognition not supported in this browser.");
      return;
    }

    if (isListening) {
      recognition.stop();
      setIsListening(false);
    } else {
      recognition.start();
      setIsListening(true);
    }
  };

  return (
    <footer className="p-3 sm:p-5 bg-white border-t border-slate-100 shrink-0">
      <div className="flex items-center gap-2 bg-[#F1F5F9] rounded-[20px] px-3 sm:px-4 py-1">
        
        <Mic
          size={18}
          onClick={handleMicClick}
          className={`cursor-pointer shrink-0 transition-colors ${
            isListening ? "text-red-600 animate-pulse" : "text-slate-400 hover:text-green-600"
          }`}
        />

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
          className={`p-2 rounded-xl transition-all shrink-0 ${
            input.trim() ? 'text-[#0B3C5D] scale-105' : 'text-slate-300'
          }`}
        >
          <Send size={20} fill={input.trim() ? "currentColor" : "none"} />
        </button>
      </div>
    </footer>
  );
};

export default ChatInput;