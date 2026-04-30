import { useEffect, useRef, useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Send, Bot, User, Loader2, Sparkles, Paperclip, Download, Plus,
  LogOut, MessageSquare, Trash2, FileSpreadsheet, X
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  file_url?: string | null;
  file_name?: string | null;
  created_at?: string;
}

interface Conversation {
  id: string;
  title: string;
  updated_at: string;
}

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const s = r.result as string;
      resolve(s.split(",")[1]);
    };
    r.onerror = reject;
    r.readAsDataURL(file);
  });

const downloadBase64 = (b64: string, name: string) => {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const blob = new Blob([bytes], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  a.click();
  URL.revokeObjectURL(url);
};

const ChatApp = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  useEffect(() => {
    if (user) loadConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  if (authLoading) return null;
  if (!user) return <Navigate to="/auth" replace />;

  async function loadConversations() {
    const { data } = await supabase
      .from("conversations")
      .select("*")
      .order("updated_at", { ascending: false });
    setConversations(data || []);
  }

  async function loadMessages(convId: string) {
    setActiveId(convId);
    const { data } = await supabase
      .from("messages")
      .select("*")
      .eq("conversation_id", convId)
      .order("created_at", { ascending: true });
    setMessages((data as Message[]) || []);
  }

  async function newConversation() {
    setActiveId(null);
    setMessages([]);
  }

  async function deleteConversation(id: string) {
    await supabase.from("conversations").delete().eq("id", id);
    if (activeId === id) {
      setActiveId(null);
      setMessages([]);
    }
    loadConversations();
  }

  async function ensureConversation(firstMessage: string): Promise<string> {
    if (activeId) return activeId;
    const title = firstMessage.substring(0, 60);
    const { data, error } = await supabase
      .from("conversations")
      .insert({ user_id: user!.id, title })
      .select()
      .single();
    if (error) throw error;
    setActiveId(data.id);
    loadConversations();
    return data.id;
  }

  async function send() {
    if (!input.trim() && !file) return;
    const userText = input.trim() || `Procesa este archivo: ${file?.name}`;
    setInput("");
    const currentFile = file;
    setFile(null);
    setIsTyping(true);

    try {
      const convId = await ensureConversation(userText);

      // Upload file if any
      let fileUrl: string | null = null;
      let fileBase64: string | null = null;
      if (currentFile) {
        fileBase64 = await fileToBase64(currentFile);
        const path = `${user!.id}/${Date.now()}_${currentFile.name}`;
        const { error: upErr } = await supabase.storage
          .from("excel-files")
          .upload(path, currentFile);
        if (!upErr) fileUrl = path;
      }

      // Save user message
      const { data: userMsg } = await supabase
        .from("messages")
        .insert({
          conversation_id: convId,
          role: "user",
          content: userText,
          file_url: fileUrl,
          file_name: currentFile?.name || null,
        })
        .select()
        .single();
      if (userMsg) setMessages((prev) => [...prev, userMsg as Message]);

      // Build history for AI
      const history = [...messages, userMsg as Message].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      // Call edge function
      const { data, error } = await supabase.functions.invoke("excel-ai-chat", {
        body: {
          messages: history,
          fileBase64,
          fileName: currentFile?.name,
        },
      });

      if (error) throw error;
      if (data.error) throw new Error(data.error);

      let assistantContent = "";
      if (data.type === "file") {
        assistantContent = `${data.explanation}\n\n📥 **Archivo procesado listo para descargar**`;
        // Trigger download
        downloadBase64(data.fileBase64, data.fileName);
        toast.success("Archivo descargado");
      } else {
        assistantContent = data.content;
      }

      const { data: aiMsg } = await supabase
        .from("messages")
        .insert({
          conversation_id: convId,
          role: "assistant",
          content: assistantContent,
        })
        .select()
        .single();
      if (aiMsg) setMessages((prev) => [...prev, aiMsg as Message]);
    } catch (e: any) {
      toast.error(e.message || "Error al procesar");
    } finally {
      setIsTyping(false);
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (!/\.(xlsx|xls|csv)$/i.test(f.name)) {
      toast.error("Solo archivos Excel (.xlsx, .xls, .csv)");
      return;
    }
    if (f.size > 10 * 1024 * 1024) {
      toast.error("Máximo 10 MB");
      return;
    }
    setFile(f);
  };

  const logout = async () => {
    await supabase.auth.signOut();
    navigate("/auth");
  };

  return (
    <div className="h-screen flex bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-72 border-r border-border flex flex-col bg-card/30 backdrop-blur-sm">
        <div className="p-4 border-b border-border">
          <button
            onClick={newConversation}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg bg-primary text-primary-foreground font-medium hover:scale-[1.02] transition-transform glow-primary"
          >
            <Plus className="w-4 h-4" /> Nueva conversación
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin">
          {conversations.length === 0 && (
            <p className="text-xs text-muted-foreground text-center mt-6">
              Tus conversaciones aparecerán aquí
            </p>
          )}
          {conversations.map((c) => (
            <div
              key={c.id}
              onClick={() => loadMessages(c.id)}
              className={`group flex items-center gap-2 px-3 py-2.5 rounded-lg cursor-pointer mb-1 transition-colors ${
                activeId === c.id
                  ? "bg-primary/15 text-foreground"
                  : "hover:bg-secondary/50 text-muted-foreground"
              }`}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />
              <span className="text-sm truncate flex-1">{c.title}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteConversation(c.id);
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 className="w-3.5 h-3.5 hover:text-destructive" />
              </button>
            </div>
          ))}
        </div>
        <div className="p-3 border-t border-border flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold text-primary">
            {(user.email?.[0] || "U").toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-foreground truncate">{user.email}</p>
          </div>
          <button
            onClick={logout}
            className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-foreground"
            title="Cerrar sesión"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>

      {/* Chat */}
      <main className="flex-1 flex flex-col">
        <header className="px-6 py-4 border-b border-border flex items-center gap-3 bg-card/30 backdrop-blur-sm">
          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-foreground">Excel Invisible AI</p>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="text-xs text-muted-foreground">
                Gemini Flash · Auxiliar contable inteligente
              </span>
            </div>
          </div>
          <Sparkles className="w-5 h-5 text-primary animate-pulse-glow" />
        </header>

        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin">
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.length === 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-12"
              >
                <div className="w-20 h-20 rounded-2xl bg-primary/20 flex items-center justify-center mx-auto mb-6 glow-primary">
                  <Bot className="w-10 h-10 text-primary" />
                </div>
                <h2 className="text-2xl font-bold mb-2">¿En qué te ayudo hoy?</h2>
                <p className="text-muted-foreground mb-8">
                  Sube un Excel o describe tu necesidad en lenguaje natural
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-xl mx-auto">
                  {[
                    "Calcula la nómina con prestaciones del mes",
                    "Genera un reporte financiero consolidado",
                    "Limpia duplicados y normaliza fechas",
                    "Aplica fórmulas de IVA y retención en columna D",
                  ].map((s) => (
                    <button
                      key={s}
                      onClick={() => setInput(s)}
                      className="text-left p-4 rounded-xl glass glass-hover text-sm text-foreground"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}

            <AnimatePresence>
              {messages.map((m) => (
                <motion.div
                  key={m.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      m.role === "assistant" ? "bg-primary/20" : "bg-accent/20"
                    }`}
                  >
                    {m.role === "assistant" ? (
                      <Bot className="w-4 h-4 text-primary" />
                    ) : (
                      <User className="w-4 h-4 text-accent" />
                    )}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-xl px-5 py-4 ${
                      m.role === "assistant"
                        ? "bg-card border border-border"
                        : "bg-primary/10 border border-primary/20"
                    }`}
                  >
                    {m.file_name && (
                      <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-lg bg-secondary/60 text-xs">
                        <FileSpreadsheet className="w-4 h-4 text-primary" />
                        <span className="truncate">{m.file_name}</span>
                      </div>
                    )}
                    <div className="prose prose-sm prose-invert max-w-none text-sm leading-relaxed [&_code]:bg-muted [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:rounded [&_code]:text-primary [&_code]:font-mono [&_pre]:bg-muted [&_pre]:rounded-lg [&_pre]:p-4 [&_h2]:text-foreground [&_h3]:text-foreground [&_strong]:text-foreground [&_p]:text-secondary-foreground [&_ul]:text-muted-foreground [&_li]:text-muted-foreground [&_table]:text-xs">
                      <ReactMarkdown>{m.content}</ReactMarkdown>
                    </div>
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
                  <span className="text-sm text-muted-foreground">
                    Procesando con IA...
                  </span>
                </div>
              </motion.div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input area */}
        <div className="border-t border-border p-4 bg-card/30 backdrop-blur-sm">
          <div className="max-w-3xl mx-auto">
            {file && (
              <div className="flex items-center gap-2 mb-3 px-3 py-2 rounded-lg bg-primary/10 border border-primary/20 text-sm">
                <FileSpreadsheet className="w-4 h-4 text-primary" />
                <span className="flex-1 truncate text-foreground">{file.name}</span>
                <span className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </span>
                <button onClick={() => setFile(null)}>
                  <X className="w-4 h-4 hover:text-destructive" />
                </button>
              </div>
            )}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="flex items-end gap-2 p-2 rounded-2xl bg-secondary/50 border border-border focus-within:ring-2 focus-within:ring-primary/50 transition-all"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-primary transition-colors"
                title="Adjuntar Excel"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                placeholder="Escribe tu instrucción... (Shift+Enter para nueva línea)"
                rows={1}
                className="flex-1 bg-transparent resize-none outline-none text-sm text-foreground placeholder:text-muted-foreground py-2.5 max-h-32"
              />
              <button
                type="submit"
                disabled={(!input.trim() && !file) || isTyping}
                className="p-2.5 rounded-lg bg-primary text-primary-foreground hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 glow-primary"
              >
                <Send className="w-5 h-5" />
              </button>
            </form>
            <p className="text-[10px] text-muted-foreground text-center mt-2">
              Excel Invisible puede cometer errores. Verifica los cálculos importantes.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatApp;
