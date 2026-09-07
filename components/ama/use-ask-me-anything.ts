'use client';

import { useCallback, useRef, useState } from 'react';

export type Source = { id: string; title: string; section: string; score: number };

export type Exchange = {
  id: string;
  question: string;
  answer: string;
  sources: Source[];
  status: 'streaming' | 'done' | 'error';
};

function decodeSourcesHeader(header: string | null): Source[] {
  if (!header) return [];
  try {
    const json = atob(header);
    return JSON.parse(json);
  } catch {
    return [];
  }
}

/**
 * Drives the Ask-Me-Anything widget: posts the question to /api/ask,
 * reads the streamed plain-text response chunk by chunk (real
 * server-sent tokens, not a client-side setInterval typewriter faking
 * it), and exposes the running conversation.
 */
export function useAskMeAnything() {
  const [exchanges, setExchanges] = useState<Exchange[]>([]);
  const [isBusy, setIsBusy] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  const ask = useCallback(async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed || isBusy) return;

    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    setExchanges((prev) => [...prev, { id, question: trimmed, answer: '', sources: [], status: 'streaming' }]);
    setIsBusy(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/ask', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: trimmed }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        const message = await res.text().catch(() => 'Something went wrong.');
        setExchanges((prev) => prev.map((e) => (e.id === id ? { ...e, answer: message, status: 'error' } : e)));
        return;
      }

      const sources = decodeSourcesHeader(res.headers.get('X-Retrieved-Sources'));
      setExchanges((prev) => prev.map((e) => (e.id === id ? { ...e, sources } : e)));

      const reader = res.body.getReader();
      const decoder = new TextDecoder();

      // eslint-disable-next-line no-constant-condition
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const textChunk = decoder.decode(value, { stream: true });
        setExchanges((prev) => prev.map((e) => (e.id === id ? { ...e, answer: e.answer + textChunk } : e)));
      }

      setExchanges((prev) => prev.map((e) => (e.id === id ? { ...e, status: 'done' } : e)));
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        setExchanges((prev) =>
          prev.map((e) => (e.id === id ? { ...e, answer: 'Connection interrupted. Please try again.', status: 'error' } : e)),
        );
      }
    } finally {
      setIsBusy(false);
      abortRef.current = null;
    }
  }, [isBusy]);

  const reset = useCallback(() => setExchanges([]), []);

  return { exchanges, ask, isBusy, reset };
}
