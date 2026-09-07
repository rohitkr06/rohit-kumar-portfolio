import { Reveal } from '@/components/motion/Reveal';

export function SectionHeading({ index, label, title, description }: { index: string; label: string; title: string; description?: string }) {
  return (
    <Reveal className="mb-12 max-w-2xl">
      <div className="mb-3 flex items-center gap-3 font-mono text-xs text-signal-cyan/70">
        <span>{index}</span>
        <span className="h-px w-8 bg-signal-cyan/40" />
        <span className="uppercase tracking-[0.25em]">{label}</span>
      </div>
      <h2 className="text-3xl font-bold text-white sm:text-4xl">{title}</h2>
      {description && <p className="mt-3 text-white/50">{description}</p>}
    </Reveal>
  );
}
