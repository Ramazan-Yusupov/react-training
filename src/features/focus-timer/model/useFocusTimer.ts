import { FOCUS_TIMER } from '@/shared/config';
import { useCallback, useEffect, useRef, useState } from 'react';

export type TimerMode = 'work' | 'break';

export interface FocusTimerDurations {
  workDuration: number;
  breakDuration: number;
}

const DEFAULT_DURATIONS: FocusTimerDurations = {
  workDuration: FOCUS_TIMER.WORK,
  breakDuration: FOCUS_TIMER.BREAK,
};

/** Таймер с настраиваемой длительностью. Время считается через Date.now(). */
export function useFocusTimer(
  onPhaseEnd?: (finished: TimerMode) => void,
  durations: FocusTimerDurations = DEFAULT_DURATIONS,
) {
  const { workDuration, breakDuration } = durations;

  const getDuration = (timerMode: TimerMode) =>
    timerMode === 'work' ? workDuration : breakDuration;

  const [mode, setMode] = useState<TimerMode>('work');
  const [remaining, setRemaining] = useState<number>(workDuration);
  const [running, setRunning] = useState(false);
  const [taskTotal, setTaskTotal] = useState<number | null>(null);

  const endsAt = useRef(0);
  const modeRef = useRef<TimerMode>('work');
  const callbackRef = useRef(onPhaseEnd);

  useEffect(() => {
    callbackRef.current = onPhaseEnd;
  }, [onPhaseEnd]);

  // При изменении настроек останавливаем таймер и начинаем новый рабочий период.
  useEffect(() => {
    setRunning(false);
    setTaskTotal(null);
    modeRef.current = 'work';
    setMode('work');
    setRemaining(workDuration);
    endsAt.current = 0;
  }, [workDuration, breakDuration]);

  useEffect(() => {
    if (!running) return;

    const id = setInterval(() => {
      const left = Math.round((endsAt.current - Date.now()) / 1000);

      if (left > 0) {
        setRemaining(left);
        return;
      }

      const finished = modeRef.current;
      setTaskTotal(null);
      const next: TimerMode = finished === 'work' ? 'break' : 'work';
      const nextDuration = getDuration(next);

      modeRef.current = next;
      endsAt.current = Date.now() + nextDuration * 1000;

      setMode(next);
      setRemaining(nextDuration);

      callbackRef.current?.(finished);
    }, 250);

    return () => clearInterval(id);
  }, [running, workDuration, breakDuration]);

  const start = useCallback(() => {
    endsAt.current = Date.now() + remaining * 1000;
    setRunning(true);
  }, [remaining]);

  const pause = useCallback(() => {
    setRunning(false);
  }, []);

  const reset = useCallback(() => {
    setTaskTotal(null);
    setRunning(false);
    modeRef.current = 'work';
    setMode('work');
    setRemaining(workDuration);
    endsAt.current = 0;
  }, [workDuration]);

  const skip = useCallback(() => {
    setTaskTotal(null);
    const next: TimerMode = modeRef.current === 'work' ? 'break' : 'work';
    const nextDuration = getDuration(next);

    modeRef.current = next;
    endsAt.current = Date.now() + nextDuration * 1000;

    setMode(next);
    setRemaining(nextDuration);
  }, [workDuration, breakDuration]);

  return {
    mode,
    remaining,
    running,
    total: taskTotal ?? getDuration(mode),
    startTask(seconds: number) {
      modeRef.current = 'work';
      setMode('work');
      setRemaining(seconds);
      setTaskTotal(seconds);
      endsAt.current = Date.now() + seconds * 1000;
      setRunning(true);
    },
    start,
    pause,
    reset,
    skip,
  };
}
