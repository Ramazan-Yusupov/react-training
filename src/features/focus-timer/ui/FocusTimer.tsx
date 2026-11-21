import { useEffect, useState } from 'react';
import { useSettingsStore } from '@/entities/settings';
import { formatClock } from '@/shared/lib';
import { Badge, Button, Input, Modal, Progress, Typography, toast } from '@/shared/ui';
import { FaForwardStep, FaGear, FaPause, FaPlay, FaRotateLeft } from 'react-icons/fa6';
import { type TimerMode, useFocusTimer } from '../model/useFocusTimer';

const MODE_LABELS: Record<TimerMode, string> = {
  work: 'Работа',
  break: 'Пауза',
};

function notifyPhaseEnd(finished: TimerMode, breakDurationMin: number) {
  if (finished === 'work') {
    toast.info(`Работа завершена. Перерыв ${breakDurationMin} мин.`);
  } else {
    toast.info('Перерыв закончился, можно работать');
  }
}

/** Таймер с настраиваемой длительностью работы и перерыва. */
export function FocusTimer() {
  const workDurationMin = useSettingsStore((state) => state.workDurationMin);
  const breakDurationMin = useSettingsStore((state) => state.breakDurationMin);
  const setFocusTimerDurations = useSettingsStore((state) => state.setFocusTimerDurations);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [workDraft, setWorkDraft] = useState(String(workDurationMin));
  const [breakDraft, setBreakDraft] = useState(String(breakDurationMin));

  const { mode, remaining, running, total, start, pause, reset, skip } = useFocusTimer(
    (finished) => notifyPhaseEnd(finished, breakDurationMin),
    {
      workDuration: workDurationMin * 60,
      breakDuration: breakDurationMin * 60,
    },
  );

  useEffect(() => {
    if (!settingsOpen) return;

    setWorkDraft(String(workDurationMin));
    setBreakDraft(String(breakDurationMin));
  }, [settingsOpen, workDurationMin, breakDurationMin]);

  const saveSettings = () => {
    const work = Number(workDraft);
    const pause = Number(breakDraft);

    if (!Number.isSafeInteger(work) || !Number.isSafeInteger(pause) || work < 1 || pause < 1) {
      toast.error('Укажи целое количество минут — не меньше 1');
      return;
    }

    setFocusTimerDurations({
      workDurationMin: work,
      breakDurationMin: pause,
    });

    setSettingsOpen(false);
    toast.success('Настройки таймера сохранены');
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <Badge color={mode === 'work' ? 'blue' : 'green'} text={MODE_LABELS[mode]} />

      <Typography
        as="span"
        className="font-mono text-5xl font-semibold"
        text={formatClock(remaining)}
      />

      <Progress value={total - remaining} max={total} color={mode === 'work' ? 'blue' : 'green'} />

      <div className="flex flex-col justify-center gap-2">
        <div className="flex gap-2">
          {running ? (
            <Button variant="primary" icon={<FaPause />} title="Пауза" onClick={pause} />
          ) : (
            <Button variant="primary" icon={<FaPlay />} title="Старт" onClick={start} />
          )}

          <Button icon={<FaRotateLeft />} title="Сброс" onClick={reset} />

          <Button icon={<FaGear />} title="Настройки" onClick={() => setSettingsOpen(true)} />
        </div>

        <Button variant="ghost" icon={<FaForwardStep />} title="Пропустить" onClick={skip} />
      </div>

      <Modal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="Настройки таймера"
        footer={
          <>
            <Button variant="ghost" title="Отмена" onClick={() => setSettingsOpen(false)} />
            <Button variant="primary" title="Сохранить" onClick={saveSettings} />
          </>
        }
      >
        <Input
          label="Длительность работы (минуты)"
          type="number"
          min={1}
          step={1}
          value={workDraft}
          onChange={(event) => setWorkDraft(event.target.value)}
        />

        <Input
          label="Длительность перерыва (минуты)"
          type="number"
          min={1}
          step={1}
          value={breakDraft}
          onChange={(event) => setBreakDraft(event.target.value)}
        />
      </Modal>
    </div>
  );
}
