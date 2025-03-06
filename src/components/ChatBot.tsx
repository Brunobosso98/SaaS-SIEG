
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  MessageCircle,
  Send,
  X,
  Bot,
  Loader2,
  MinusCircle,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface Message {
  role: "user" | "assistant";
  content: string;
}

// This would be set in a real environment variable
const DEFAULT_API_KEY = import.meta.env.VITE_OPENAI_API_KEY || "";

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to bottom of messages when new messages are added
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  const toggleChat = () => {
    setIsOpen(!isOpen);
    setIsMinimized(false);
    
    // Add welcome message if opening for the first time and no messages exist
    if (!isOpen && messages.length === 0) {
      setMessages([
        {
          role: "assistant",
          content:
            "Olá! Sou o assistente virtual do XMLFiscal. Como posso ajudar você hoje?",
        },
      ]);
    }
  };

  const handleMinimize = () => {
    setIsMinimized(!isMinimized);
  };

  const sendMessage = async () => {
    if (input.trim() === "") return;
    
    // Add user message
    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      if (!DEFAULT_API_KEY) {
        throw new Error("API key not configured");
      }

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DEFAULT_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            {
              role: "system",
              content: `Você é um assistente virtual para o XMLFiscal, um software SaaS que automatiza o download de XMLs fiscais.
              
              Informações importantes sobre o XMLFiscal:
              - O serviço permite o download automático de XMLs do portal SIEG.
              - Tipos de documentos suportados: NFE (Nota Fiscal Eletrônica), CTE (Conhecimento de Transporte Eletrônico), NFSe (Nota Fiscal de Serviços Eletrônica), NFCe (Nota Fiscal de Consumidor Eletrônica) e CF-e (Cupom Fiscal Eletrônico).
              - Facilita a vida de contadores e empresas que precisam baixar muitos XMLs diariamente.
              - Possui funcionalidade de agendamento para downloads automáticos diários, semanais ou mensais.
              - Suporta gerenciamento de múltiplos CNPJs em uma única interface.
              - Oferece relatórios detalhados de downloads e status de processamento.
              - Possui planos diferentes com limites de downloads e funcionalidades variadas.
              
              Seu papel é responder dúvidas sobre o XMLFiscal de forma educada e prestativa. Se não souber alguma informação específica, sugira que o usuário entre em contato com o suporte.`,
            },
            ...messages.map(msg => ({
              role: msg.role,
              content: msg.content,
            })),
            { role: "user", content: input },
          ],
          max_tokens: 500,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      const assistantMessage: Message = {
        role: "assistant",
        content: data.choices[0].message.content,
      };
      
      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error("Error:", error);
      let errorMessage = "Ocorreu um erro ao processar sua solicitação.";
      
      if ((error as Error).message === "API key not configured") {
        errorMessage = "A chave API da OpenAI não está configurada. Por favor, configure a variável de ambiente VITE_OPENAI_API_KEY.";
      } else if ((error as Error).message.includes("401")) {
        errorMessage = "Chave de API inválida. Por favor, verifique a chave da OpenAI.";
      }
      
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: errorMessage },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Chat Button - Improved design with gradient and animation */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-primary to-primary/80 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-primary/20 transition-all z-50 hover:scale-110 animate-pulse hover:animate-none"
        aria-label="Chat bot"
      >
        <Bot className="w-6 h-6" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div
          className={`fixed right-6 bottom-24 bg-background border border-border shadow-xl rounded-lg z-50 transition-all duration-300 ease-in-out ${
            isMinimized
              ? "w-72 h-12 overflow-hidden"
              : "w-80 sm:w-96 h-[500px] max-h-[80vh]"
          }`}
        >
          {/* Chat Header */}
          <div className="flex items-center justify-between bg-gradient-to-r from-primary to-primary/90 text-primary-foreground p-3 rounded-t-lg">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5" />
              <h3 className="font-medium">Assistente XMLFiscal</h3>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleMinimize}
                className="p-1 rounded-full hover:bg-primary-foreground/10 transition-colors"
                aria-label={isMinimized ? "Expand" : "Minimize"}
              >
                <MinusCircle className="w-4 h-4" />
              </button>
              <button
                onClick={toggleChat}
                className="p-1 rounded-full hover:bg-primary-foreground/10 transition-colors"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {!isMinimized && (
            <>
              {/* Chat Messages */}
              <div className="flex-1 p-3 overflow-y-auto h-[370px] bg-gradient-to-b from-background to-background/95">
                {messages.map((message, index) => (
                  <div
                    key={index}
                    className={`mb-3 ${
                      message.role === "user" ? "text-right" : "text-left"
                    }`}
                  >
                    <div
                      className={`inline-block rounded-lg px-3 py-2 max-w-[85%] ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted"
                      }`}
                    >
                      {message.content}
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="text-left mb-3">
                    <div className="inline-block rounded-lg px-3 py-2 bg-muted">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-3 border-t border-border">
                <div className="flex gap-2">
                  <Input
                    placeholder="Digite sua mensagem..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    disabled={isLoading || !DEFAULT_API_KEY}
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    onClick={sendMessage}
                    disabled={isLoading || !DEFAULT_API_KEY || input.trim() === ""}
                    className="bg-primary hover:bg-primary/90"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
                {!DEFAULT_API_KEY && (
                  <p className="text-xs text-destructive mt-2">
                    Por favor, configure a variável de ambiente VITE_OPENAI_API_KEY para usar o chat.
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
