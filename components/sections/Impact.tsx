import { impactStats } from '@/content/profile';
import { SectionHeading } from './SectionHeading';
import { Reveal } from '@/components/motion/Reveal';
import { GlassCard } from '@/components/ui/glass-card';
import { AnimatedCounter } from '@/components/ui/animated-counter';

export function Impact() {
  return (
    <section id="impact" className="relative mx-auto max-w-6xl px-6 py-28">
      <SectionHeading
        index="01"
        label="Impact"
        title="Numbers, not adjectives."
        description="Every figure below traces back to a specific system Rohit built or rebuilt in production."
      />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {impactStats.map((stat, i) => (
          <Reveal key={stat.id} delay={i * 0.06}>
            <GlassCard className="group h-full p-5 transition-colors hover:border-signal-cyan/40 sm:p-6">
              <div className="font-mono text-3xl font-bold text-white sm:text-4xl">
                <AnimatedCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
              </div>
              <p className="mt-2 text-sm text-white/50">{stat.label}</p>
              <p className="mt-3 text-xs leading-relaxed text-white/30 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                {stat.detail}
              </p>
            </GlassCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
