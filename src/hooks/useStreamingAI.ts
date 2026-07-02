import { useState, useCallback, useRef } from 'react';

interface StreamingAIOptions {
  onChunk?: (chunk: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: string) => void;
}

interface StreamingAIResult {
  text: string;
  isStreaming: boolean;
  error: string | null;
  stream: (prompt: string, systemInstruction?: string) => Promise<string>;
  stop: () => void;
  reset: () => void;
}

/**
 * React hook for consuming streaming AI responses from /api/gemini/stream
 * Provides real-time token display with stop/reset capabilities
 */
export function useStreamingAI(options: StreamingAIOptions = {}): StreamingAIResult {
  const [text, setText] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const stop = useCallback(() => {
    abortControllerRef.current?.abort();
    setIsStreaming(false);
  }, []);

  const reset = useCallback(() => {
    setText('');
    setError(null);
    setIsStreaming(false);
  }, []);

  const stream = useCallback(async (prompt: string, systemInstruction?: string): Promise<string> => {
    setText('');
    setError(null);
    setIsStreaming(true);

    abortControllerRef.current = new AbortController();
    let fullText = '';

    try {
      const response = await fetch('/api/gemini/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, systemInstruction }),
        signal: abortControllerRef.current.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP error: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) throw new Error('No response body');

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') break;

            try {
              const data = JSON.parse(dataStr);
              if (data.text) {
                fullText += data.text;
                setText(fullText);
                options.onChunk?.(data.text);
              } else if (data.error) {
                throw new Error(data.error);
              }
            } catch (parseErr) {
              // skip malformed SSE chunks
            }
          }
        }
      }

      options.onComplete?.(fullText);
      return fullText;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        // Graceful stop — return what we have so far
        return fullText;
      }
      const errorMsg = err.message || 'Streaming failed';
      setError(errorMsg);
      options.onError?.(errorMsg);
      throw err;
    } finally {
      setIsStreaming(false);
      abortControllerRef.current = null;
    }
  }, [options]);

  return { text, isStreaming, error, stream, stop, reset };
}

/**
 * Utility: Parse SSE stream from fetch response
 * Low-level helper for custom streaming implementations
 */
export async function* parseSSEStream(response: Response): AsyncGenerator<string> {
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  if (!reader) return;

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const dataStr = line.slice(6).trim();
          if (dataStr === '[DONE]') return;
          try {
            const data = JSON.parse(dataStr);
            if (data.text) yield data.text;
          } catch {
            // skip
          }
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
}
