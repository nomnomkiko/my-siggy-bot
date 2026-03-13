"use client";

import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function App() {
  const [messages, setMessages] = useState<{ role: 'user' | 'siggy'; text: string }[]>([
    { role: 'siggy', text: "gRitual! Hihihi, what brings you here today? :D" }
  ]);
  const [input, setInput] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages]);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input;
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMsg, history: messages }),
      });
      const data = await res.json();
      setMessages(prev => [...prev, { role: 'siggy', text: data.reply }]);
    } catch (e) {
      setMessages(prev => [...prev, { role: 'siggy', text: "hiks~ My spell failed! Try again?" }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-black text-white selection:bg-white/30">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400&family=League+Spartan:wght@700&display=swap');
        .glacial { font-family: 'Arial', sans-serif; } 
        .motter { font-family: 'Impact', sans-serif; font-weight: bold; }
        .spartan { font-family: 'League Spartan', sans-serif; }
        .poppins { font-family: 'Poppins', sans-serif; }
        .vignette {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: radial-gradient(circle, transparent 70%, rgba(0,0,0,0.1) 100%);
          pointer-events: none; z-index: 5;
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
      `}</style>
      
      {/* Background Artwork */}
      <div 
        className={`absolute inset-0 bg-cover bg-center transition-all duration-700 ${isSidebarOpen ? 'blur-[20px] scale-110' : 'scale-100'}`}
        style={{ backgroundImage: `url('/ritual-2.jpg')` }} 
      />
      <div className="vignette" />

      {/* Main Chat Area */}
      <div className={`relative z-10 flex flex-col h-full w-full max-w-2xl mx-auto px-4 pt-10 pb-24 transition-all duration-500 ${isSidebarOpen ? 'blur-[20px] opacity-0 pointer-events-none' : 'opacity-100'}`}>
        
        <button onClick={() => setIsSidebarOpen(true)} className="absolute top-4 right-4 z-50 p-2 hover:scale-110 transition-transform">
          <ChevronLeft size={32} />
        </button>

        <div ref={scrollRef} className="flex-1 overflow-y-auto space-y-8 no-scrollbar pt-10 pb-10">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <span className={`motter text-2xl mb-1 tracking-wider ${msg.role === 'user' ? 'text-white' : 'text-black'}`}>
                {msg.role === 'user' ? 'YOU' : 'SIGGY'}
              </span>
              <div className={`glacial max-w-[85%] p-4 rounded-2xl text-lg shadow-xl leading-relaxed ${
                msg.role === 'user' ? 'bg-[#d9d9d9]/90 text-black/70 rounded-tr-none' : 'bg-black/90 text-white/70 rounded-tl-none'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          {loading && <div className="text-gray motter animate-pulse text-xl">SIGGY IS TYPING...</div>}
        </div>

        {/* Input Bar */}
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 w-full max-w-xl px-4">
          <div className="flex items-center bg-white/40 backdrop-blur-xl p-2 rounded-full border border-white/30 shadow-2xl">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Chat with Siggy.."
              className="glacial flex-1 bg-transparent border-none outline-none px-6 text-black placeholder:text-black/50 text-lg"
            />
            <button onClick={handleSend} className="glacial text-black px-8 py-2 font-bold hover:opacity-60 transition-opacity">Send</button>
          </div>
        </div>
      </div>

      {/* Info Panel Overlay */}
      {isSidebarOpen && (
        <div onClick={handleOverlayClick} className="absolute inset-0 z-40 flex items-center justify-center p-6 bg-black/10 backdrop-blur-sm transition-all animate-in fade-in duration-500">
          <div ref={panelRef} className="bg-[#d9d9d9]/90 w-full max-w-md p-10 rounded-[3.5rem] shadow-2xl flex flex-col items-center text-center animate-in zoom-in-95 duration-300">
            <div className="absolute top-6 right-8 cursor-pointer" onClick={() => setIsSidebarOpen(false)}>
              <ChevronRight size={32} className="text-black/50" />
            </div>
            
            <h1 className="spartan text-5xl text-black/70 mb-2 mt-4">My Siggy</h1>
            <p className="poppins text-sm text-black/50 mb-12">Created by Kai - @nomnomkiko</p>
            
            <button 
              onClick={() => { setMessages([{ role: 'siggy', text: "Meowtual! Hihihi!" }]); setIsSidebarOpen(false); }} 
              className="glacial w-full py-5 bg-[#ff0000]/30 text-black font-bold rounded-2xl mb-12 hover:bg-[#ff0000]/50 transition-colors"
            >
              Clear chat
            </button>
            
            <div className="flex gap-8 mt-auto">
              <a href="https://discord.ritual.net" target="_blank"><img src="/discord.png" className="w-14 h-14 object-contain hover:scale-110 transition-transform" /></a>
              <a href="https://x.com/ritualnet" target="_blank"><img src="/x.png" className="w-14 h-14 object-contain hover:scale-110 transition-transform" /></a>
              <a href="https://ritual.net" target="_blank"><img src="/ritual-logo.png" className="w-14 h-14 object-contain hover:scale-110 transition-transform" /></a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}