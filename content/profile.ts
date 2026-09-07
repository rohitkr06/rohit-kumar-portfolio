/**
 * Single source of truth for Rohit's background.
 *
 * Every other surface — the hero, the impact counters, the experience
 * timeline, the bento grid, and the "Ask Me Anything" retrieval corpus —
 * is derived from this file. Edit this file, re-run `npm run
 * embeddings:build`, and the whole site (including the AMA widget) stays
 * in sync with zero duplication.
 */

export const personal = {
  name: 'Rohit Kumar',
  title: 'Backend Engineer',
  subtitle: 'Node.js · TypeScript · Distributed Systems',
  location: 'Noida, India',
  email: 'rohitk61299@gmail.com',
  linkedin: 'https://linkedin.com/in/rohit-kumar-2a628013a',
  github: 'https://github.com/rohitkr06',
  tagline:
    'I build the backend infrastructure behind AI voice agents that talk to thousands of real customers, live.',
  summary:
    "Backend Engineer with 3 years of experience building and scaling production Node.js/TypeScript services for AI voice and messaging platforms. Core engineer on JustCall's AIVA (AI Voice Agent) platform from launch to 7,000+ customers, with end-to-end ownership across live-call orchestration, event-driven pipelines, caching infrastructure, and incident response.",
} as const;

export type ImpactStat = {
  id: string;
  value: number;
  suffix: string;
  prefix?: string;
  label: string;
  detail: string;
};

export const impactStats: ImpactStat[] = [
  {
    id: 'customers',
    value: 7000,
    suffix: '+',
    label: 'customers on AIVA',
    detail: 'Scaled live-call orchestration on AIVA from launch to 7,000+ customers.',
  },
  {
    id: 'calls',
    value: 5000,
    suffix: '/day',
    prefix: '~',
    label: 'AI voice calls',
    detail: 'Backend supports roughly 5,000 AI voice calls per day in production.',
  },
  {
    id: 'arr',
    value: 1.1,
    suffix: 'M',
    prefix: '$',
    label: 'ARR enterprise deal',
    detail: 'The Enterprise Action Framework was tied to a $1.1M ARR enterprise deal.',
  },
  {
    id: 'rows',
    value: 100,
    suffix: 'M+',
    label: 'rows migrated',
    detail: 'Led a zero-downtime MySQL 5.x → 8 migration across 100M+ rows (120GB+).',
  },
  {
    id: 'throughput',
    value: 10,
    suffix: 'x',
    label: 'SMS throughput',
    detail: 'The MySQL 8 migration improved SMS throughput by up to 10x.',
  },
  {
    id: 'moderation',
    value: 90,
    suffix: '%',
    prefix: '~',
    label: 'less manual review',
    detail: 'Automated SMS campaign moderation cut manual review workload by ~90%.',
  },
  {
    id: 'dbload',
    value: 60,
    suffix: '%',
    prefix: '~',
    label: 'less DB load',
    detail: 'Redis caching for voice-agent configs cut MongoDB load by ~60%.',
  },
  {
    id: 'memory',
    value: 33,
    suffix: '%',
    prefix: '~',
    label: 'lower pod memory',
    detail: 'Right-sized Kubernetes pod memory by 33%, fixing HPA scaling 3→7-8 replicas at peak.',
  },
];

export type ExperienceBullet = {
  heading: string;
  body: string;
};

export type ExperienceEntry = {
  id: string;
  role: string;
  company: string;
  companyDetail: string;
  start: string;
  end: string;
  location: string;
  bullets: ExperienceBullet[];
};

export const experience: ExperienceEntry[] = [
  {
    id: 'sde2',
    role: 'Software Development Engineer II',
    company: 'SaaS Labs',
    companyDetail: 'JustCall / AIVA',
    start: 'Apr 2025',
    end: 'Present',
    location: 'Noida, India',
    bullets: [
      {
        heading: 'Enterprise Action Framework',
        body: 'Designed a three-stage orchestration framework — pre-call context injection, in-call tools for SMS/calendar booking/live-agent transfer, and post-call data extraction — tied to an enterprise deal worth $1.1M ARR.',
      },
      {
        heading: 'Live Call Orchestration',
        body: "Built and scaled AIVA's backend orchestration from launch to 7,000+ customers, supporting ~5,000 AI voice calls a day, integrated with Retell AI, OpenAI, Twilio, and Deepgram.",
      },
      {
        heading: 'Event-Driven Post-Call Pipeline',
        body: 'Architected a fault-isolated pipeline using GCP Pub/Sub and Cloud Tasks that acknowledges webhooks only after publishing events, then processes them asynchronously with retries.',
      },
      {
        heading: 'Configuration Caching',
        body: 'Added Redis caching with a 30-minute TTL for voice-agent configs, eliminating ~6 redundant MongoDB reads per webhook and cutting DB load by ~60%.',
      },
      {
        heading: 'Kubernetes Efficiency',
        body: 'Right-sized pod memory by 33% and fixed misconfigured HPA targets, letting the cluster scale 3→7-8 replicas at peak — eliminating pod restarts and cutting cluster memory footprint by ~33%.',
      },
      {
        heading: 'Reliability & Observability',
        body: 'Instrumented LLM/ASR/TTS latency and cost telemetry via Langfuse, Grafana, New Relic, and Sentry; used LaunchDarkly for feature rollouts; served as PagerDuty first responder.',
      },
    ],
  },
  {
    id: 'sde1',
    role: 'Software Development Engineer I',
    company: 'SaaS Labs',
    companyDetail: 'JustCall',
    start: 'Jul 2023',
    end: 'Mar 2025',
    location: 'Noida, India',
    bullets: [
      {
        heading: 'Zero-Downtime Database Migration',
        body: 'Led a MySQL 5.x → 8 migration across 100M+ rows (120GB+) with zero downtime, improving SMS throughput by up to 10x.',
      },
      {
        heading: 'SMS Campaign Moderation',
        body: 'Built automated moderation to block policy-violating campaigns before they went out, cutting manual review workload by ~90%.',
      },
      {
        heading: 'AI Agent Provisioning',
        body: "Designed AIVA's initial self-serve provisioning backend from scratch — agent creation, configuration, multi-tenant isolation, and lifecycle management.",
      },
      {
        heading: 'Platform Modernization',
        body: 'Migrated legacy PHP SMS APIs to TypeScript/NestJS + TypeORM, cutting latency from ~2s to under 800ms, deployed on Kubernetes for zero-downtime releases.',
      },
    ],
  },
];

export type SkillGroup = {
  id: string;
  label: string;
  items: string[];
  size?: 'sm' | 'md' | 'lg';
};

export const skillGroups: SkillGroup[] = [
  { id: 'languages', label: 'Languages', items: ['TypeScript', 'JavaScript', 'PHP', 'SQL', 'C++'], size: 'md' },
  { id: 'backend', label: 'Backend & APIs', items: ['Node.js', 'NestJS', 'REST APIs', 'Microservices', 'TypeORM', 'Sequelize'], size: 'lg' },
  { id: 'data', label: 'Databases & Cache', items: ['MySQL', 'MongoDB', 'Redis', 'BigQuery'], size: 'md' },
  { id: 'infra', label: 'Cloud & Infra', items: ['GCP Pub/Sub', 'Cloud Tasks', 'Kubernetes', 'Docker', 'LaunchDarkly'], size: 'md' },
  { id: 'ai', label: 'AI & Voice', items: ['OpenAI', 'Retell AI', 'Twilio', 'Deepgram', 'Langfuse', 'Prompt Engineering'], size: 'lg' },
  { id: 'observability', label: 'Observability', items: ['Grafana', 'New Relic', 'Sentry', 'PagerDuty', 'Distributed Tracing'], size: 'md' },
  { id: 'architecture', label: 'Architecture', items: ['Distributed Systems', 'Event-Driven Architecture', 'System Design', 'Multi-Tenancy'], size: 'sm' },
];

export const education = {
  degree: 'B.Tech, Information Technology',
  school: "Bharati Vidyapeeth's College of Engineering, New Delhi",
  start: '2019',
  end: '2023',
  gpa: '9.05/10 CGPA',
};

export type Achievement = {
  id: string;
  title: string;
  org: string;
  date: string;
  detail: string;
};

export const achievements: Achievement[] = [
  {
    id: 'lab-legend',
    title: 'Lab Legend Award',
    org: 'SaaS Labs',
    date: 'Feb 2026',
    detail: 'Ranked top 12 of 70 engineers company-wide, recognizing engineering ownership.',
  },
  {
    id: 'retention',
    title: 'Customer Retention Award',
    org: 'SaaS Labs',
    date: '',
    detail: 'Awarded for rebuilding voice-agent prompts and call flows to save an at-risk enterprise account.',
  },
];

export const siteMeta = {
  title: 'Rohit Kumar — Backend Engineer',
  description:
    'Backend Engineer building production Node.js/TypeScript systems for AI voice platforms. Core engineer on JustCall’s AIVA, scaled to 7,000+ customers and ~5,000 AI voice calls/day.',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://rohitkumar.dev',
};
