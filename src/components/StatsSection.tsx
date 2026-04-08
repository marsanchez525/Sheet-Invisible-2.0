import { motion } from "framer-motion";

const stats = [
  { value: "95%", label: "Precisión en fórmulas generadas" },
  { value: "10x", label: "Más rápido que procesos manuales" },
  { value: "50+", label: "Tipos de fórmulas soportadas" },
  { value: "24/7", label: "Disponibilidad del sistema" },
];

const StatsSection = () => {
  return (
    <section className="py-16 px-6 border-y border-border/30">
      <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, scale: 0.8 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.1 }}
            className="text-center"
          >
            <div className="text-4xl md:text-5xl font-bold text-primary glow-text mb-2">{s.value}</div>
            <div className="text-sm text-muted-foreground">{s.label}</div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default StatsSection;
