import { motion } from "framer-motion";
import { FileInput, Brain, Cpu, FileOutput, ArrowRight } from "lucide-react";

const steps = [
  { icon: FileInput, title: "Entrada", desc: "El usuario carga su hoja de cálculo o describe su necesidad en lenguaje natural", color: "text-primary" },
  { icon: Brain, title: "Análisis NLP", desc: "El motor de procesamiento de lenguaje natural interpreta la instrucción y el contexto", color: "text-accent" },
  { icon: Cpu, title: "Generación", desc: "El sistema genera fórmulas optimizadas adaptadas al contexto administrativo detectado", color: "text-primary" },
  { icon: FileOutput, title: "Resultado", desc: "Se entrega la fórmula con explicación detallada y se aplica automáticamente", color: "text-accent" },
];

const ArchitectureSection = () => {
  return (
    <section id="architecture" className="py-24 px-6 relative">
      <div className="absolute inset-0 bg-grid opacity-10" />
      <div className="max-w-6xl mx-auto relative">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Arquitectura del <span className="text-primary glow-text">Sistema</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Flujo de procesamiento inteligente desde la entrada hasta la automatización
          </p>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-4 lg:gap-2">
          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15 }}
              className="flex items-center gap-2 lg:gap-4"
            >
              <div className="p-6 rounded-xl glass glass-hover text-center min-w-[220px]">
                <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <step.icon className={`w-7 h-7 ${step.color}`} />
                </div>
                <h3 className="font-semibold text-foreground mb-1">{step.title}</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                <div className="mt-3 text-xs font-mono text-primary/60">Paso {i + 1}</div>
              </div>
              {i < steps.length - 1 && (
                <ArrowRight className="w-6 h-6 text-primary/40 hidden lg:block shrink-0" />
              )}
            </motion.div>
          ))}
        </div>

        {/* Tech stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-16 p-8 rounded-xl glass text-center"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Stack Tecnológico</h3>
          <div className="flex flex-wrap justify-center gap-3">
            {["Python", "NLP / SpaCy", "OpenAI API", "React", "TypeScript", "Tailwind CSS", "Excel API", "FastAPI"].map((tech) => (
              <span key={tech} className="px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-mono">
                {tech}
              </span>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ArchitectureSection;
