import { formatClock } from '@/shared/lib';
import { Badge, Button, Progress, Typography, toast } from '@/shared/ui';
import { FaForwardStep, FaPause, FaPlay, FaRotateLeft } from 'react-icons/fa6';
import { type TimerMode, useFocusTimer } from '../model/useFocusTimer';

const MODE_LABELS: Record<TimerMode, string> = { work: 'Работа', break: 'Пауза' };

function notifyPhaseEnd(finished: TimerMode) {
  if (finished === 'work') toast.info('Пауза 10 минут: встань и брось кубик');
  else toast.info('Пауза закончилась, можно работать');
}

/** Таймер 50/10: 50 минут работы, 10 минут паузы. */
export function FocusTimer() {
  const { mode, remaining, running, total, start, pause, reset, skip } =
    useFocusTimer(notifyPhaseEnd);

  return (
    <div className="flex flex-col items-center gap-4">
      <Badge color={mode === 'work' ? 'blue' : 'green'} text={MODE_LABELS[mode]} />
      <Typography
        as="span"
        className="font-mono text-5xl font-semibold"
        text={formatClock(remaining)}
      />
      <Progress value={total - remaining} max={total} color={mode === 'work' ? 'blue' : 'green'} />
      <div className="flex flex-wrap justify-center gap-2">
        {running ? (
          <Button variant="primary" icon={<FaPause />} title="Пауза" onClick={pause} />
        ) : (
          <Button variant="primary" icon={<FaPlay />} title="Старт" onClick={start} />
        )}
        <Button icon={<FaRotateLeft />} title="Сброс" onClick={reset} />
        <Button variant="ghost" icon={<FaForwardStep />} title="Пропустить" onClick={skip} />
      </div>
    </div>
  );
}
