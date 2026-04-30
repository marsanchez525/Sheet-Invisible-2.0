import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Brain, Menu, X } from "lucide-react";
import logoAi from "@/assets/logo-ai.png";

const links = [
  { label: "Inicio", href: "#" },
  { label: "Módulos", href: "#features" },
  { label: "Asistente IA", href: "#chat" },
  { label: "Arquitectura", href: "#architecture" },
  { label: "Acerca de", href: "#about" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-border/50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-3">
          <img src={logoAi} alt="Logo" className="w-8 h-8" width={32} height={32} />
          <span className="font-bold text-lg text-foreground">
            Excel <span className="text-primary">Invisible</span>
          </span>
        </a>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-8">
          {links.map((l) => (
            <a key={l.label} href={l.href} className="text-sm text-muted-foreground hover:text-primary transition-colors">
              {l.label}
            </a>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <a href="/auth" className="text-sm text-muted-foreground hover:text-primary transition-colors">
            Iniciar sesión
          </a>
          <a href="/app" className="px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:scale-105 transition-transform inline-block glow-primary">
            Probar IA
          </a>
        </div>

        {/* Mobile toggle */}
        <button onClick={() => setOpen(!open)} className="md:hidden text-foreground">
          {open ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="md:hidden overflow-hidden glass border-t border-border/50"
          >
            <div className="px-6 py-4 space-y-3">
              {links.map((l) => (
                <a
                  key={l.label}
                  href={l.href}
                  onClick={() => setOpen(false)}
                  className="block text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  {l.label}
                </a>
              ))}
              <a href="/auth" onClick={() => setOpen(false)} className="block text-sm text-muted-foreground">
                Iniciar sesión
              </a>
              <a href="/app" onClick={() => setOpen(false)} className="block px-5 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium text-center">
                Probar IA
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
