
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

export function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const localStorageKeyName = "openai_api_key";

  useEffect(() => {
    // Check local storage for API key
    const storedApiKey = localStorage.getItem(localStorageKeyName);
    if (storedApiKey) {
      setApiKey(storedApiKey);
    }
  }, []);

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

  const handleApiKeyChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setApiKey(e.target.value);
  };

  const saveApiKey = () => {
    if (apiKey.trim().length > 0) {
      localStorage.setItem(localStorageKeyName, apiKey);
      toast({
        title: "API Key salva",
        description: "Sua chave da OpenAI foi salva no navegador.",
      });
    } else {
      toast({
        title: "Erro",
        description: "Por favor, insira uma chave API válida.",
        variant: "destructive",
      });
    }
  };

  const sendMessage = async () => {
    if (input.trim() === "") return;
    
    // Add user message
    const userMessage: Message = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      if (!apiKey) {
        throw new Error("API key not provided");
      }

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
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
      
      if ((error as Error).message === "API key not provided") {
        errorMessage = "Por favor, insira sua chave da API da OpenAI nas configurações do chat.";
      } else if ((error as Error).message.includes("401")) {
        errorMessage = "Chave de API inválida. Por favor, verifique sua chave da OpenAI.";
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
      {/* Chat Button */}
      <button
        onClick={toggleChat}
        className="fixed bottom-6 right-6 bg-primary text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:bg-primary/90 transition-all z-50 hover:scale-110"
        aria-label="Chat bot"
      >
        <MessageCircle className="w-6 h-6" />
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
          <div className="flex items-center justify-between bg-primary text-primary-foreground p-3 rounded-t-lg">
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
              {/* API Key Input (show only if no API key) */}
              {!apiKey && (
                <div className="p-3 border-b border-border">
                  <div className="text-sm mb-2">
                    Para usar o chat, insira sua chave da API da OpenAI:
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="password"
                      placeholder="sk-..."
                      value={apiKey}
                      onChange={handleApiKeyChange}
                      className="flex-1 text-xs"
                    />
                    <Button size="sm" onClick={saveApiKey}>
                      Salvar
                    </Button>
                  </div>
                </div>
              )}

              {/* Chat Messages */}
              <div className="flex-1 p-3 overflow-y-auto h-[370px]">
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
                    disabled={isLoading || !apiKey}
                    className="flex-1"
                  />
                  <Button
                    size="icon"
                    onClick={sendMessage}
                    disabled={isLoading || !apiKey || input.trim() === ""}
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      )}
    </>
  );
}
