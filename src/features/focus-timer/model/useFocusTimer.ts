import { FOCUS_TIMER } from '@/shared/config';
import { useCallback, useEffect, useRef, useState } from 'react';

export type TimerMode = 'work' | 'break';

const DURATION: Record<TimerMode, number> = { work: FOCUS_TIMER.WORK, break: FOCUS_TIMER.BREAK };

/** Таймер 50/10. Время считается по часам (Date.now), поэтому не уплывает в фоновой вкладке. */
export function useFocusTimer(onPhaseEnd?: (finished: TimerMode) => void) {
  const [mode, setMode] = useState<TimerMode>('work');
  const [remaining, setRemaining] = useState<number>(DURATION.work);
  const [running, setRunning] = useState(false);

  const endsAt = useRef(0);
  const modeRef = useRef<TimerMode>('work');
  const callbackRef = useRef(onPhaseEnd);

  useEffect(() => {
    callbackRef.current = onPhaseEnd;
  }, [onPhaseEnd]);

  useEffect(() => {
    if (!running) return;

    const id = setInterval(() => {
      const left = Math.round((endsAt.current - Date.now()) / 1000);
      if (left > 0) {
        setRemaining(left);
        return;
      }
      const finished = modeRef.current;
      const next: TimerMode = finished === 'work' ? 'break' : 'work';
      modeRef.current = next;
      endsAt.current = Date.now() + DURATION[next] * 1000;
      setMode(next);
      setRemaining(DURATION[next]);
      callbackRef.current?.(finished);
    }, 250);

    return () => clearInterval(id);
  }, [running]);

  const start = useCallback(() => {
    endsAt.current = Date.now() + remaining * 1000;
    setRunning(true);
  }, [remaining]);

  const pause = useCallback(() => setRunning(false), []);

  const reset = useCallback(() => {
    setRunning(false);
    modeRef.current = 'work';
    setMode('work');
    setRemaining(DURATION.work);
  }, []);

  const skip = useCallback(() => {
    const next: TimerMode = modeRef.current === 'work' ? 'break' : 'work';
    modeRef.current = next;
    endsAt.current = Date.now() + DURATION[next] * 1000;
    setMode(next);
    setRemaining(DURATION[next]);
  }, []);

  return { mode, remaining, running, total: DURATION[mode], start, pause, reset, skip };
}
