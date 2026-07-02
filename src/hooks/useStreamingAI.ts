import { useState, useCallback, useRef } from 'react';
import { aiClient, HIGH_THINKING_CONFIG } from '../utils/geminiClient';

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
 * React hook for consuming streaming AI responses directly via Gemini Client SDK
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
      const responseStream = await aiClient.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          systemInstruction,
          ...HIGH_THINKING_CONFIG
        }
      });

      for await (const chunk of responseStream) {
        if (abortControllerRef.current?.signal.aborted) {
          break;
        }
        if (chunk.text) {
          fullText += chunk.text;
          setText(fullText);
          options.onChunk?.(chunk.text);
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
