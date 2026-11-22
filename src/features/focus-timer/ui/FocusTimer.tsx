import { useEffect, useState } from 'react';

import { useSettingsStore } from '@/entities/settings';
import { formatClock } from '@/shared/lib';
import { Badge, Button, Input, Modal, Progress, Typography, toast } from '@/shared/ui';

import { FaBell, FaForwardStep, FaGear, FaPause, FaPlay, FaRotateLeft } from 'react-icons/fa6';

import { useBrowserNotifications } from '../model/useBrowserNotifications';
import { type TimerMode, useFocusTimer } from '../model/useFocusTimer';

const BREAK_LABEL = 'Пауза';

function notifyPhaseEnd(
  finished: TimerMode,
  breakDurationMin: number,
  notifyBrowser: (title: string, body: string) => void,
) {
  if (finished === 'work') {
    const message = `Работа завершена. Перерыв ${breakDurationMin} мин.`;

    toast.info(message);
    notifyBrowser('Planer — время отдохнуть', message);
  } else {
    const message = 'Перерыв закончился, можно работать';

    toast.info(message);
    notifyBrowser('Planer — пора работать', message);
  }
}

/** Таймер с настраиваемой длительностью и названием рабочего режима. */
export function FocusTimer() {
  const workDurationMin = useSettingsStore((state) => state.workDurationMin);
  const breakDurationMin = useSettingsStore((state) => state.breakDurationMin);
  const workLabel = useSettingsStore((state) => state.workLabel);

  const setFocusTimerDurations = useSettingsStore((state) => state.setFocusTimerDurations);
  const setFocusTimerLabel = useSettingsStore((state) => state.setFocusTimerLabel);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [workDraft, setWorkDraft] = useState(String(workDurationMin));
  const [breakDraft, setBreakDraft] = useState(String(breakDurationMin));
  const [labelDraft, setLabelDraft] = useState(workLabel);

  const { permission, requestPermission, notify } = useBrowserNotifications();

  const { mode, remaining, running, total, start, pause, reset, skip } = useFocusTimer(
    (finished) => notifyPhaseEnd(finished, breakDurationMin, notify),
    {
      workDuration: workDurationMin * 60,
      breakDuration: breakDurationMin * 60,
    },
  );

  useEffect(() => {
    if (!settingsOpen) return;

    setWorkDraft(String(workDurationMin));
    setBreakDraft(String(breakDurationMin));
    setLabelDraft(workLabel);
  }, [settingsOpen, workDurationMin, breakDurationMin, workLabel]);

  const saveSettings = () => {
    const work = Number(workDraft);
    const pause = Number(breakDraft);
    const label = labelDraft.trim();

    if (!Number.isSafeInteger(work) || !Number.isSafeInteger(pause) || work < 1 || pause < 1) {
      toast.error('Укажи целое количество минут — не меньше 1');
      return;
    }

    if (!label || label.length > 32) {
      toast.error('Название должно содержать от 1 до 32 символов');
      return;
    }

    setFocusTimerDurations({
      workDurationMin: work,
      breakDurationMin: pause,
    });

    setFocusTimerLabel(label);

    setSettingsOpen(false);
    toast.success('Настройки таймера сохранены');
  };

  const enableNotifications = async () => {
    const result = await requestPermission();

    if (result === 'granted') {
      toast.success('Браузерные уведомления включены');
      return;
    }

    if (result === 'denied') {
      toast.error('Разреши уведомления для Planer в настройках браузера');
      return;
    }

    toast.info('Браузерные уведомления не поддерживаются');
  };

  const notificationLabel =
    permission === 'granted'
      ? 'Уведомления включены'
      : permission === 'denied'
        ? 'Разрешение заблокировано в браузере'
        : permission === 'unsupported'
          ? 'Уведомления не поддерживаются'
          : 'Включить браузерные уведомления';

  return (
    <div className="flex flex-col items-center gap-4">
      <Badge
        color={mode === 'work' ? 'blue' : 'green'}
        text={mode === 'work' ? workLabel : BREAK_LABEL}
      />

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
          label="Название режима работы"
          placeholder="Например: Учёба"
          maxLength={32}
          value={labelDraft}
          onChange={(event) => setLabelDraft(event.target.value)}
        />

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

        <div className="flex flex-col gap-2">
          <Button
            variant="outline"
            fullWidth
            icon={<FaBell />}
            disabled={permission !== 'default'}
            onClick={enableNotifications}
          >
            {notificationLabel}
          </Button>

          <Typography align="start" tone="muted" className="text-xs">
            Уведомления сообщат об окончании работы и перерыва, даже если вкладка Planer открыта в
            фоне.
          </Typography>
        </div>
      </Modal>
    </div>
  );
}
