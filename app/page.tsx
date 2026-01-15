'use client';

import { useChat } from 'ai/react';
import { useState, useRef, useEffect } from 'react';
import { Send, Image as ImageIcon, Sparkles, User, Terminal } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function ChatPage() {
  const { messages, input, handleInputChange, handleSubmit, setMessages, isLoading: isChatLoading } = useChat();
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGeneratingImage]);

  // Handler customizado para interceptar comandos de imagem
  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Lógica para gerar imagem se começar com /img
    if (input.trim().toLowerCase().startsWith('/img')) {
      const prompt = input.replace(/^\/img\s*/i, '');
      
      // Adiciona mensagem do usuário
      const userMessage = { 
        id: Date.now().toString(), 
        role: 'user' as const, 
        content: input 
      };
      
      setMessages(prev => [...prev, userMessage]);
      handleInputChange({ target: { value: '' } } as any); // Limpa input
      setIsGeneratingImage(true);

      try {
        const res = await fetch('/api/image', {
          method: 'POST',
          body: JSON.stringify({ prompt }),
        });
        const data = await res.json();

        if (data.image) {
          // Adiciona "mensagem" de imagem do assistente
          const aiMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant' as const,
            content: `![Gerada: ${prompt}](${data.image})`, // Markdown de imagem
          };
          setMessages(prev => [...prev, aiMessage]);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsGeneratingImage(false);
      }
    } else {
      // Fluxo normal de texto (Groq)
      handleSubmit(e);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-[#09090b] text-zinc-100 font-sans selection:bg-zinc-700">
      {/* Header Minimalista */}
      <header className="flex items-center justify-between px-6 py-4 border-b border-zinc-900 bg-[#09090b]/80 backdrop-blur fixed w-full z-10">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse shadow-[0_0_10px_#22c55e]" />
          <h1 className="font-semibold text-sm tracking-widest uppercase text-zinc-400">Groq + Cloudflare AI</h1>
        </div>
        <a href="https://github.com/seu-usuario" target="_blank" className="text-xs text-zinc-600 hover:text-zinc-300 transition">
          v1.0.0
        </a>
      </header>

      {/* Área de Chat */}
      <main className="flex-1 overflow-y-auto pt-20 pb-32 px-4 scrollbar-thin scrollbar-thumb-zinc-800">
        <div className="max-w-3xl mx-auto space-y-8">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center mt-32 text-center space-y-4 opacity-50 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800">
                <Sparkles className="w-8 h-8 text-zinc-400" />
              </div>
              <p className="text-zinc-500">Comece uma conversa ou digite <code className="bg-zinc-800 px-1 py-0.5 rounded text-zinc-300">/img prompt</code> para criar arte.</p>
            </div>
          )}

          {messages.map(m => (
            <div key={m.id} className={`flex gap-4 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {/* Avatar AI */}
              {m.role !== 'user' && (
                <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                  <Terminal className="w-4 h-4 text-emerald-500" />
                </div>
              )}

              {/* Bolha da Mensagem */}
              <div className={`relative px-5 py-3.5 rounded-2xl max-w-[85%] shadow-sm leading-relaxed ${
                m.role === 'user' 
                  ? 'bg-zinc-100 text-black rounded-tr-sm' 
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-sm'
              }`}>
                <ReactMarkdown 
                  remarkPlugins={[remarkGfm]}
                  components={{
                    // Customização para imagens renderizadas
                    img: ({node, ...props}) => (
                      <div className="my-3 overflow-hidden rounded-lg border border-zinc-700">
                         {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img {...props} alt="AI Generated" className="max-w-full h-auto hover:scale-105 transition duration-500" />
                      </div>
                    ),
                    code: ({node, ...props}) => (
                      <code {...props} className="bg-black/30 px-1 py-0.5 rounded text-zinc-200 font-mono text-sm" />
                    )
                  }}
                >
                  {m.content}
                </ReactMarkdown>
              </div>

               {/* Avatar User */}
               {m.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-zinc-400" />
                </div>
              )}
            </div>
          ))}

          {/* Estado de Carregamento para Imagem */}
          {isGeneratingImage && (
            <div className="flex gap-4">
               <div className="w-8 h-8 rounded-full bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0 animate-spin">
                  <Sparkles className="w-4 h-4 text-purple-500" />
                </div>
                <div className="px-5 py-3.5 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 animate-pulse">
                  Gerando sua imagem na Cloudflare...
                </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input Area */}
      <div className="fixed bottom-0 w-full bg-gradient-to-t from-[#09090b] via-[#09090b] to-transparent pt-10 pb-6 px-4">
        <div className="max-w-3xl mx-auto">
          <form onSubmit={onSubmit} className="relative group">
            <input
              className="w-full bg-zinc-900/80 backdrop-blur-xl border border-zinc-800 text-zinc-200 rounded-full pl-6 pr-14 py-4 focus:outline-none focus:ring-2 focus:ring-zinc-700 focus:border-zinc-700 transition-all shadow-lg placeholder:text-zinc-600"
              value={input}
              onChange={handleInputChange}
              placeholder="Digite uma mensagem ou /img para gerar imagem..."
              disabled={isChatLoading || isGeneratingImage}
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex gap-2">
               {input.startsWith('/img') && (
                 <div className="text-xs font-medium text-purple-400 bg-purple-400/10 px-2 py-1 rounded flex items-center gap-1">
                   <ImageIcon className="w-3 h-3" /> ART
                 </div>
               )}
              <button 
                type="submit" 
                disabled={!input.trim() || isChatLoading || isGeneratingImage}
                className="w-10 h-10 bg-zinc-100 hover:bg-white text-black rounded-full flex items-center justify-center transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isChatLoading ? (
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Send className="w-4 h-4 ml-0.5" />
                )}
              </button>
            </div>
          </form>
          <p className="text-center text-[10px] text-zinc-700 mt-3">
            Groq Llama 3 & Cloudflare Flux/SDXL. AI pode cometer erros.
          </p>
        </div>
      </div>
    </div>
  );
}
