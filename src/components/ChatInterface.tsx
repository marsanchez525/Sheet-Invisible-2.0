import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, Bot, User, Loader2, Sparkles, FileSpreadsheet, Calculator, Package, TrendingUp } from "lucide-react";
import ReactMarkdown from "react-markdown";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

const quickActions = [
  { icon: Calculator, label: "Calcular nómina", prompt: "Necesito calcular la nómina de un empleado con salario base de $2.500.000" },
  { icon: FileSpreadsheet, label: "Crear reporte", prompt: "Genera un reporte financiero mensual con los datos de ventas" },
  { icon: Package, label: "Inventario", prompt: "Ayúdame a crear un control de inventario con método promedio ponderado" },
  { icon: TrendingUp, label: "Análisis ventas", prompt: "Analiza las tendencias de ventas del último trimestre" },
];

const demoResponses: Record<string, string> = {
  default: `## 🧠 Análisis Completado

He analizado tu solicitud. Aquí tienes la fórmula recomendada:

\`\`\`excel
=SI(B2>1000000; B2*0.04; 0)
\`\`\`

### 📋 Explicación:
- **B2**: Celda que contiene el salario base
- **1.000.000**: Umbral para el cálculo
- **0.04**: Porcentaje aplicado (4%)

### 💡 Recomendación:
Aplica esta fórmula en la columna C para todos los empleados. El sistema detectó que tu hoja tiene estructura de **nómina mensual**.

¿Necesitas que ajuste los parámetros o genere fórmulas adicionales?`,
};

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "## ¡Hola! Soy **Excel Invisible** 🧠\n\nTu asistente inteligente para automatización de hojas de cálculo. Puedo ayudarte con:\n\n- 📊 **Nómina** — Cálculos salariales y prestaciones\n- 📈 **Ventas** — Análisis y consolidación\n- 📦 **Inventarios** — Control y valorización\n- 📋 **Reportes** — Estados financieros automatizados\n\nEscribe tu solicitud en lenguaje natural y yo generaré las fórmulas adaptadas a tu contexto empresarial.",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: text,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsTyping(true);

    // Simulate AI response
    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: demoResponses.default,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  return (
    <section id="chat" className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Asistente <span className="text-primary glow-text">IA</span> Interactivo
          </h2>
          <p className="text-muted-foreground text-lg">
            Escribe instrucciones en lenguaje natural y obtén fórmulas contextualizadas
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="rounded-2xl glass overflow-hidden border border-border"
        >
          {/* Chat header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-border bg-card/50">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-semibold text-foreground text-sm">Excel Invisible AI</p>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-xs text-muted-foreground">En línea · Modelo NLP v2.0</span>
              </div>
            </div>
            <div className="ml-auto flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-primary animate-pulse-glow" />
              <span className="text-xs text-primary font-mono">UDEC</span>
            </div>
          </div>

          {/* Messages */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-6 scrollbar-thin">
            <AnimatePresence>
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      msg.role === "assistant" ? "bg-primary/20" : "bg-accent/20"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <Bot className="w-4 h-4 text-primary" />
                    ) : (
                      <User className="w-4 h-4 text-accent" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-xl px-5 py-4 ${
                      msg.role === "assistant"
                        ? "bg-card border border-border"
                        : "bg-primary/10 border border-primary/20"
                    }`}
                  >
                    <div className="prose prose-sm prose-invert max-w-none text-sm leading-relaxed text-foreground [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-primary [&_code]:font-mono [&_pre]:bg-muted [&_pre]:rounded-lg [&_pre]:p-4 [&_h2]:text-foreground [&_h3]:text-foreground [&_strong]:text-foreground [&_ul]:text-muted-foreground [&_li]:text-muted-foreground [&_p]:text-secondary-foreground">
                      <ReactMarkdown>{msg.content}</ReactMarkdown>
                    </div>
                    <span className="text-[10px] text-muted-foreground mt-2 block">
                      {msg.timestamp.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>

            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-card border border-border rounded-xl px-5 py-4 flex items-center gap-2">
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                  <span className="text-sm text-muted-foreground">Analizando contexto...</span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick actions */}
          <div className="px-6 py-3 border-t border-border/50 flex gap-2 overflow-x-auto scrollbar-thin">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => sendMessage(action.prompt)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 text-secondary-foreground text-xs font-medium whitespace-nowrap transition-colors"
              >
                <action.icon className="w-3.5 h-3.5" />
                {action.label}
              </button>
            ))}
          </div>

          {/* Input */}
          <div className="px-6 py-4 border-t border-border">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                sendMessage(input);
              }}
              className="flex items-center gap-3"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Escribe tu instrucción en lenguaje natural..."
                className="flex-1 bg-secondary/50 rounded-lg px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="w-11 h-11 rounded-lg bg-primary text-primary-foreground flex items-center justify-center hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 glow-primary"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ChatInterface;
