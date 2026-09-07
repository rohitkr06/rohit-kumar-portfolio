import { personal } from '@/content/profile';
import { Reveal } from '@/components/motion/Reveal';
import { buttonVariants } from '@/components/ui/button';
import { Github, Linkedin, Mail } from 'lucide-react';

export function Contact() {
  return (
    <section id="contact" className="relative mx-auto max-w-4xl px-6 py-28 text-center">
      <Reveal>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-signal-cyan/70">05 · Contact</p>
        <h2 className="mt-3 text-4xl font-bold text-white sm:text-5xl">Let&apos;s build something reliable.</h2>
        <p className="mx-auto mt-4 max-w-lg text-white/50">
          Open to backend / infrastructure roles working on systems that actually run in production, at scale.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a href={`mailto:${personal.email}`} className={buttonVariants({ size: 'lg' })}>
            <Mail className="mr-1 h-4 w-4" />
            {personal.email}
          </a>
        </div>

        <div className="mt-8 flex items-center justify-center gap-4">
          <a
            href={personal.github}
            target="_blank"
            rel="noreferrer"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/60 transition-colors hover:border-signal-cyan/50 hover:text-signal-cyan"
            aria-label="GitHub"
          >
            <Github className="h-5 w-5" />
          </a>
          <a
            href={personal.linkedin}
            target="_blank"
            rel="noreferrer"
            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-white/[0.03] text-white/60 transition-colors hover:border-signal-cyan/50 hover:text-signal-cyan"
            aria-label="LinkedIn"
          >
            <Linkedin className="h-5 w-5" />
          </a>
        </div>
      </Reveal>

      <footer className="mt-24 border-t border-white/5 pt-8 font-mono text-xs text-white/25">
        <p>
          © {new Date().getFullYear()} {personal.name}. Built with Next.js, react-three-fiber, and a homegrown RAG pipeline.
        </p>
      </footer>
    </section>
  );
}
