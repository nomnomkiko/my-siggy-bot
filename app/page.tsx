"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Send } from 'lucide-react';

const Typewriter = ({ text = "", speed = 10, onComplete, onUpdate }: { text: string, speed?: number, onComplete?: () => void, onUpdate?: () => void }) => {
  const [displayedText, setDisplayedText] = useState('');
  
  useEffect(() => {
    if (!text) {
      if (onComplete) onComplete();
      return;
    }

    let i = 0;
    const timer = setInterval(() => {
      setDisplayedText(text.slice(0, i + 1));
      i++;
      if (onUpdate) onUpdate();
      if (i >= text.length) {
        clearInterval(timer);
        if (onComplete) onComplete();
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return <div className="whitespace-pre-wrap">{displayedText}</div>;
};

export default function App() {
  const [messages, setMessages] = useState<{ role: 'user' | 'siggy'; text: string; time: string; isTyping?: boolean }[]>([
    { 
      role: 'siggy', 
      text: "Meowtual! Hihihi! I'm Siggy! Is there any fun that you want to share? :D",
      time: "" 
    }
  ]);
  const [input, setInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);


  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth", block: "end" });
    }
  };

  useEffect(() => {
    setIsMounted(true);
    setMessages(prev => [
      { ...prev[0], time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
  }, []);


  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMsg = input;
    const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    setMessages(prev => [...prev, { role: 'user', text: userMsg, time: currentTime }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMsg, 
          history: messages.map(m => ({ role: m.role, text: m.text })) 
        }),
      });

      const data = await res.json();
      const siggyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      
      const replyText = data.reply || data.error || "Meow? I lost my voice! Try again?";
      
      setMessages(prev => [...prev, { 
        role: 'siggy', 
        text: replyText, 
        time: siggyTime,
        isTyping: true 
      }]);
    } catch (e) {
      setMessages(prev => [...prev, { 
        role: 'siggy', 
        text: "MIAW! My spell broke! Can we try again? 🐾", 
        time: currentTime 
      }]);
    } finally {
      setLoading(false);
    }
  };

  if (!isMounted) return <div className="bg-black h-screen w-screen" />;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black text-white selection:bg-white/20">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400&family=League+Spartan:wght@700&display=swap');
        
        @font-face { font-family: 'Motter Carpus'; src: url('/fonts/MotterCarpus.ttf') format('truetype'); }
        @font-face { font-family: 'Glacial Indifference'; src: url('/fonts/GlacialIndifference.otf') format('opentype'); }

        .glacial { font-family: 'Glacial Indifference', sans-serif; }
        .motter { font-family: 'Motter Carpus', sans-serif; }
        .spartan { font-family: 'League Spartan', sans-serif; }
        .poppins { font-family: 'Poppins', sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        

        @keyframes blink {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(1.1); }
        }
        .online-dot { animation: blink 2s infinite ease-in-out; box-shadow: 0 0 8px #4ade80; }

        /* Liquid Glass Design (Applied to Sidebar and Input) */
        .liquid-glass {
          background: rgba(255, 255, 255, 0.08);
          backdrop-filter: blur(40px) saturate(180%);
          -webkit-backdrop-filter: blur(40px) saturate(180%);
          border: 1px solid rgba(255, 255, 255, 0.15);
          box-shadow: 
            0 20px 40px rgba(0,0,0,0.4),
            inset 0 0 0 1px rgba(255, 255, 255, 0.1);
        }
      `}</style>
      
      <div 
        className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ${isSidebarOpen ? 'blur-[20px] scale-110' : 'scale-100'}`}
        style={{ backgroundImage: `url('/ritual-2.jpg')` }} 
      />

      <div className={`relative z-10 flex flex-col h-full w-full max-w-2xl mx-auto px-4 transition-all duration-500 ${isSidebarOpen ? 'blur-[20px] opacity-0 pointer-events-none' : 'opacity-100'}`}>
        
        <header className="flex justify-between items-center py-6 h-20 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-green-400 rounded-full online-dot" />
            <div className="spartan text-2xl tracking-tighter italic opacity-80 uppercase">Siggy</div>
          </div>
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:scale-110 transition-transform">
            <ChevronLeft size={32} />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto space-y-8 no-scrollbar pt-4 pb-2 scroll-smooth">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <span className={`motter text-2xl mb-1 tracking-widest uppercase ${msg.role === 'user' ? 'text-white' : 'text-black'}`}>
                {msg.role === 'user' ? 'You' : 'Siggy'}
              </span>
              <div className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} max-w-[90%]`}>
                <div className={`glacial p-5 rounded-[2rem] text-lg shadow-2xl leading-relaxed ${
                  msg.role === 'user' 
                  ? 'bg-[#d9d9d9]/90 text-black/70 rounded-tr-none' 
                  : 'bg-black/90 text-white/70 rounded-tl-none border border-white/10'
                }`}>
                  {msg.role === 'siggy' && msg.isTyping ? (
                    <Typewriter 
                      text={msg.text} 
                      onUpdate={scrollToBottom}
                      onComplete={() => {
                        const newMsgs = [...messages];
                        newMsgs[idx].isTyping = false;
                        setMessages(newMsgs);

                      }} 
                    />
                  ) : (
                    <div className="whitespace-pre-wrap">{msg.text}</div>
                  )}
                </div>
                {msg.time && (
                  <span className="poppins text-[10px] mt-2 opacity-50 px-2 uppercase tracking-widest text-white/70">
                    {msg.time}
                  </span>
                )}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2 ml-2 pb-4">
              <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 bg-white/40 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Box Form Style */}
        <div className="shrink-0 w-full pt-2 pb-8">
          <div className="liquid-glass flex items-center p-2 rounded-full shadow-2xl">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Message Siggy..."
              className="glacial flex-1 bg-transparent border-none outline-none px-6 text-white placeholder:text-white/40 text-lg"
            />
            <button onClick={handleSend} className="bg-transparent text-white p-4 font-bold hover:opacity-70 transition-opacity">
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>

      {isSidebarOpen && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/40 backdrop-blur-md" onClick={() => setIsSidebarOpen(false)}>
          <div className="liquid-glass w-full max-w-md p-10 rounded-[3.5rem] flex flex-col items-center text-center relative" onClick={e => e.stopPropagation()}>
            <button onClick={() => setIsSidebarOpen(false)} className="absolute top-6 right-8 p-2 hover:scale-110 transition-transform">
              <ChevronRight size={32} />
            </button>
            <h1 className="spartan text-5xl mb-1 tracking-tighter text-white">MY SIGGY</h1>
            <p className="poppins text-xs tracking-widest text-white/50 uppercase mb-8">The Guardian of Ritual</p>
            
            <button 
              onClick={() => { 
                setMessages([{ role: 'siggy', text: "Memory cleared! Mwhii!", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]); 
                setIsSidebarOpen(false); 
              }}
              className="w-full py-5 bg-red-500/20 text-red-100 font-bold rounded-2xl hover:bg-red-500/30 transition-all glacial text-xl mb-10 border border-red-500/30 shadow-lg"
            >
              Clear Chat
            </button>

            <div className="flex gap-8 mt-auto">
              <a href="https://discord.ritual.net" target="_blank" className="hover:scale-110 transition-transform"><img src="/discord.png" className="w-14 h-14" /></a>
              <a href="https://x.com/ritualnet" target="_blank" className="hover:scale-110 transition-transform"><img src="/x.png" className="w-14 h-14" /></a>
              <a href="https://ritual.net" target="_blank" className="hover:scale-110 transition-transform"><img src="/ritual-logo.png" className="w-14 h-14" /></a>
            </div>
            <p className="poppins text-[10px] text-white/30 mt-8 tracking-widest uppercase">Created by Kai - @nomnomkiko</p>
          </div>
        </div>
      )}
    </div>
  );
}