import { skillGroups } from '@/content/profile';
import { SectionHeading } from './SectionHeading';
import { Reveal } from '@/components/motion/Reveal';
import { GlassCard } from '@/components/ui/glass-card';
import { cn } from '@/lib/utils';

const SIZE_CLASSES: Record<string, string> = {
  sm: 'sm:col-span-2 lg:col-span-2',
  md: 'sm:col-span-3 lg:col-span-3',
  lg: 'sm:col-span-6 lg:col-span-4',
};

export function Skills() {
  return (
    <section id="skills" className="relative mx-auto max-w-6xl px-6 py-28">
      <SectionHeading index="03" label="Skills" title="The stack, end to end." description="From the language to the pager that wakes him up at 3am." />

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-6">
        {skillGroups.map((group, i) => (
          <Reveal key={group.id} delay={i * 0.05} className={cn('col-span-2', SIZE_CLASSES[group.size ?? 'md'])}>
            <GlassCard className="h-full p-6 transition-all hover:border-signal-cyan/40 hover:bg-white/[0.05]">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-signal-cyan/70">{group.label}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {group.items.map((item) => (
                  <span
                    key={item}
                    className="rounded-lg border border-white/10 bg-white/[0.03] px-2.5 py-1 text-xs text-white/70"
                  >
                    {item}
                  </span>
                ))}
              </div>
            </GlassCard>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
