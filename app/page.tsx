import { Hero } from '@/components/hero/Hero';
import { Impact } from '@/components/sections/Impact';
import { Experience } from '@/components/sections/Experience';
import { Skills } from '@/components/sections/Skills';
import { Achievements } from '@/components/sections/Achievements';
import { Contact } from '@/components/sections/Contact';

export default function Home() {
  return (
    <main>
      <Hero />
      <Impact />
      <Experience />
      <Skills />
      <Achievements />
      <Contact />
    </main>
  );
}
