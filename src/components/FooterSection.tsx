import { Brain, Github, Mail, ExternalLink } from "lucide-react";
import logoAi from "@/assets/logo-ai.png";

const FooterSection = () => {
  return (
    <footer id="about" className="border-t border-border/30 py-16 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-12">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <img src={logoAi} alt="Logo" className="w-8 h-8" width={32} height={32} loading="lazy" />
              <span className="font-bold text-lg text-foreground">Excel <span className="text-primary">Invisible</span></span>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Sistema Inteligente Contextual para la Automatización y Enseñanza de Hojas de Cálculo en Entornos Administrativos en PYMES.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Proyecto Académico</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Universidad de Cundinamarca</li>
              <li>Ingeniería de Sistemas y Computación</li>
              <li>Ciencia, Tecnología e Innovación</li>
              <li>Martin Sanchez Rangel</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Módulos</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><a href="#features" className="hover:text-primary transition-colors">Nómina Inteligente</a></li>
              <li><a href="#features" className="hover:text-primary transition-colors">Reportes Financieros</a></li>
              <li><a href="#features" className="hover:text-primary transition-colors">Control de Inventarios</a></li>
              <li><a href="#chat" className="hover:text-primary transition-colors">Asistente IA</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border/30 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © 2026 UCundinamarca · Excel Invisible · Todos los derechos reservados
          </p>
          <div className="flex items-center gap-4">
            <a href="https://www.ucundinamarca.edu.co" target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-primary transition-colors">
              <ExternalLink className="w-4 h-4" />
            </a>
            <a href="mailto:contacto@ucundinamarca.edu.co" className="text-muted-foreground hover:text-primary transition-colors">
              <Mail className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default FooterSection;
