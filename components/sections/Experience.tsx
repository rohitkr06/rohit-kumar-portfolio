import { experience } from '@/content/profile';
import { SectionHeading } from './SectionHeading';
import { Reveal } from '@/components/motion/Reveal';
import { GlassCard } from '@/components/ui/glass-card';
import { Badge } from '@/components/ui/badge';

export function Experience() {
  return (
    <section id="experience" className="relative mx-auto max-w-5xl px-6 py-16 sm:py-20">
      <SectionHeading index="02" label="Experience" title="Where the systems live." />

      <div className="relative space-y-10 border-l border-white/10 pl-8 sm:pl-10">
        {experience.map((role, i) => (
          <Reveal key={role.id} delay={i * 0.1} className="relative">
            <span className="absolute -left-[2.55rem] top-1.5 h-3 w-3 rounded-full border-2 border-signal-cyan bg-void shadow-[0_0_12px_rgba(51,225,230,0.6)] sm:-left-[3.05rem]" />

            <GlassCard className="p-6 sm:p-8">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <h3 className="text-xl font-semibold text-white">{role.role}</h3>
                  <p className="mt-0.5 font-mono text-sm text-signal-cyan/80">
                    {role.company} <span className="text-white/45">·</span> {role.companyDetail}
                  </p>
                </div>
                <Badge variant="outline" className="font-mono text-[11px]">
                  {role.start} — {role.end}
                </Badge>
              </div>
              <p className="mt-1 text-xs text-white/50">{role.location}</p>

              <ul className="mt-5 space-y-4">
                {role.bullets.map((b) => (
                  <li key={b.heading} className="flex gap-3">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-signal-violet" />
                    <p className="text-sm leading-relaxed text-white/70">
                      <span className="font-medium text-white/90">{b.heading}: </span>
                      {b.body}
                    </p>
                  </li>
                ))}
              </ul>
            </GlassCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
