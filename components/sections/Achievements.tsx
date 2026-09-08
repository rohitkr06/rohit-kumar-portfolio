import { achievements, education } from '@/content/profile';
import { SectionHeading } from './SectionHeading';
import { Reveal } from '@/components/motion/Reveal';
import { GlassCard } from '@/components/ui/glass-card';
import { Award, GraduationCap } from 'lucide-react';

export function Achievements() {
  return (
    <section id="achievements" className="relative mx-auto max-w-6xl px-6 py-16 sm:py-20">
      <SectionHeading index="04" label="Recognition" title="Awards & education." />

      <div className="grid gap-4 lg:grid-cols-3">
        {achievements.map((a, i) => (
          <Reveal key={a.id} delay={i * 0.08} className="lg:col-span-1">
            <GlassCard className="h-full p-6 transition-colors hover:border-signal-violet/40">
              <Award className="h-5 w-5 text-signal-violet" />
              <h3 className="mt-4 text-lg font-semibold text-white">{a.title}</h3>
              <p className="font-mono text-xs text-white/55">
                {a.org}
                {a.date && ` · ${a.date}`}
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/60">{a.detail}</p>
            </GlassCard>
          </Reveal>
        ))}

        <Reveal delay={achievements.length * 0.08} className="lg:col-span-1">
          <GlassCard className="h-full p-6 transition-colors hover:border-signal-cyan/40">
            <GraduationCap className="h-5 w-5 text-signal-cyan" />
            <h3 className="mt-4 text-lg font-semibold text-white">{education.degree}</h3>
            <p className="font-mono text-xs text-white/55">
              {education.start} — {education.end}
            </p>
            <p className="mt-3 text-sm leading-relaxed text-white/60">{education.school}</p>
            <p className="mt-1 text-sm text-signal-cyan/70">{education.gpa}</p>
          </GlassCard>
        </Reveal>
      </div>
    </section>
  );
}
