import { motion } from "framer-motion";
import {
  Calculator, FileSpreadsheet, Users, Package,
  TrendingUp, ShieldCheck, Bot, BookOpen
} from "lucide-react";

const features = [
  {
    icon: Calculator,
    title: "Nómina Inteligente",
    desc: "Cálculos automáticos de salarios, deducciones, aportes a seguridad social y prestaciones sociales con fórmulas contextualizadas.",
  },
  {
    icon: FileSpreadsheet,
    title: "Reportes Financieros",
    desc: "Generación de estados financieros, balances y reportes contables automatizados con análisis de datos en tiempo real.",
  },
  {
    icon: Package,
    title: "Control de Inventarios",
    desc: "Gestión inteligente de stock, alertas de reabastecimiento y valorización de inventarios con métodos PEPS, UEPS y promedio.",
  },
  {
    icon: TrendingUp,
    title: "Gestión de Ventas",
    desc: "Consolidación de ventas, análisis de tendencias, proyecciones y dashboards interactivos para toma de decisiones.",
  },
  {
    icon: Bot,
    title: "Procesamiento de Lenguaje Natural",
    desc: "Interactúa con tus hojas de cálculo usando lenguaje cotidiano. La IA interpreta tus instrucciones y genera fórmulas automáticamente.",
  },
  {
    icon: BookOpen,
    title: "Módulo Explicativo",
    desc: "Cada fórmula generada incluye una explicación detallada para que comprendas los cálculos y aprendas mientras trabajas.",
  },
  {
    icon: ShieldCheck,
    title: "Validación de Datos",
    desc: "Detección automática de errores, inconsistencias y anomalías en tus hojas de cálculo con sugerencias de corrección.",
  },
  {
    icon: Users,
    title: "Diseñado para PYMES",
    desc: "Solución accesible y adaptada a las necesidades reales de pequeñas y medianas empresas colombianas.",
  },
];

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

const item = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const FeaturesSection = () => {
  return (
    <section id="features" className="py-24 px-6 relative">
      <div className="absolute inset-0 bg-grid opacity-10" />
      <div className="max-w-7xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Módulos del <span className="text-primary glow-text">Sistema</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Un ecosistema completo de herramientas inteligentes para la automatización administrativa
          </p>
        </motion.div>

        <motion.div
          variants={container}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {features.map((f) => (
            <motion.div
              key={f.title}
              variants={item}
              className="group p-6 rounded-xl glass glass-hover transition-all duration-300 hover:glow-primary cursor-pointer"
            >
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                <f.icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{f.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default FeaturesSection;
