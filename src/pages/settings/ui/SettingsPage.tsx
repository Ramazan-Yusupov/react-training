import { gamification } from '@/entities/plan';
import { createInitialProgress, useProgressStore, type ProgressData } from '@/entities/progress';
import { DEFAULT_SETTINGS, useSettingsStore, type SettingsData } from '@/entities/settings';
import { OptionalPostureSwitch } from '@/features/toggle-optional-posture';
import { WorkStartSelect } from '@/features/set-work-start';
import { Button, Card, Input, Modal, Typography, toast } from '@/shared/ui';
import { useRef, useState } from 'react';

interface BackupData {
  version: 1;
  exportedAt: string;
  progress: ProgressData;
  settings: SettingsData;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function validateBackup(value: unknown): value is BackupData {
  if (!isRecord(value) || value.version !== 1) return false;

  const { progress, settings } = value;

  if (!isRecord(progress) || !isRecord(settings)) return false;

  const validProgress =
    typeof progress.startDate === 'string' &&
    (typeof progress.postureStartDate === 'string' || progress.postureStartDate === null) &&
    isRecord(progress.completed) &&
    isRecord(progress.microBreaks) &&
    isRecord(progress.corsetMinutes) &&
    isRecord(progress.measurements);

  const validSettings =
    typeof settings.workStartHour === 'number' &&
    settings.workStartHour >= 5 &&
    settings.workStartHour <= 12 &&
    typeof settings.showOptionalPosture === 'boolean' &&
    isRecord(settings.rewards);

  return validProgress && validSettings;
}

export function SettingsPage() {
  const [resetOpen, setResetOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const rewards = useSettingsStore((state) => state.rewards);
  const setReward = useSettingsStore((state) => state.setReward);

  const replaceProgress = useProgressStore((state) => state.replaceAll);
  const resetProgress = useProgressStore((state) => state.reset);

  const replaceSettings = useSettingsStore((state) => state.replaceAll);

  const handleExport = () => {
    const progressState = useProgressStore.getState();
    const settingsState = useSettingsStore.getState();

    const backup: BackupData = {
      version: 1,
      exportedAt: new Date().toISOString(),
      progress: {
        startDate: progressState.startDate,
        postureStartDate: progressState.postureStartDate,
        completed: progressState.completed,
        microBreaks: progressState.microBreaks,
        corsetMinutes: progressState.corsetMinutes,
        measurements: progressState.measurements,
      },
      settings: {
        workStartHour: settingsState.workStartHour,
        showOptionalPosture: settingsState.showOptionalPosture,
        rewards: settingsState.rewards,
      },
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    link.href = url;
    link.download = `planer-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();

    URL.revokeObjectURL(url);
    toast.success('Резервная копия создана');
  };

  const handleImport = async (file?: File) => {
    if (!file) return;

    try {
      const parsed: unknown = JSON.parse(await file.text());

      if (!validateBackup(parsed)) {
        toast.error('Файл не является корректной резервной копией Planer');
        return;
      }

      replaceProgress(parsed.progress);
      replaceSettings(parsed.settings);

      toast.success('Данные успешно восстановлены');
    } catch {
      toast.error('Не удалось прочитать файл');
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleReset = () => {
    resetProgress();
    setResetOpen(false);
    toast.success('Прогресс сброшен');
  };

  return (
    <div className="flex min-w-0 flex-col gap-4 sm:gap-6">
      <header className="flex flex-col gap-1">
        <Typography as="h2" align="start">
          Настройки
        </Typography>

        <Typography align="start" tone="muted">
          Персональные параметры, награды и управление данными
        </Typography>
      </header>

      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
        <section className="flex min-w-0 flex-col gap-4">
          <Card title="Режим дня">
            <WorkStartSelect />

            <div className="border-t border-white/10 pt-4">
              <OptionalPostureSwitch />
            </div>
          </Card>

          <Card title="Награды за уровни">
            <Typography align="start" tone="muted" className="text-sm">
              Придумай небольшую награду, которую получишь после достижения каждого уровня.
            </Typography>

            {gamification.levels.map((level) => (
              <Input
                key={level.id}
                label={level.title}
                hint={
                  level.xp
                    ? `${level.xp.toLocaleString('ru-RU')} XP`
                    : 'Открывается после финального испытания'
                }
                placeholder="Например: купить что-нибудь приятное"
                value={rewards[level.id] ?? ''}
                onChange={(event) => setReward(level.id, event.target.value)}
              />
            ))}
          </Card>
        </section>

        <section className="flex min-w-0 flex-col gap-4">
          <Card title="Резервная копия">
            <Typography align="start" tone="muted" className="text-sm">
              Сохрани тренировки, выполненные задачи, замеры, настройки и выбранные награды в
              JSON-файл.
            </Typography>

            <Button variant="primary" fullWidth onClick={handleExport}>
              Экспортировать данные
            </Button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              className="hidden"
              onChange={(event) => handleImport(event.target.files?.[0])}
            />

            <Button fullWidth onClick={() => fileInputRef.current?.click()}>
              Импортировать резервную копию
            </Button>

            <Typography align="start" tone="muted" className="text-xs">
              Импорт заменит текущий прогресс и настройки данными из файла. Перед импортом
              рекомендуется сделать экспорт.
            </Typography>
          </Card>

          <Card title="Сброс данных" border="1px" borderColor="rgb(239 68 68 / 0.35)">
            <Typography align="start" tone="muted" className="text-sm">
              Удаляет историю выполнения задач, замеры, очки и прогресс обоих планов. Настройки и
              выбранные награды останутся.
            </Typography>

            <Button variant="danger" fullWidth onClick={() => setResetOpen(true)}>
              Сбросить прогресс
            </Button>
          </Card>

          <Card title="О приложении">
            <div className="flex flex-col gap-2">
              <div className="flex justify-between gap-3">
                <Typography align="start" tone="muted">
                  Приложение
                </Typography>
                <Typography>Planer</Typography>
              </div>

              <div className="flex justify-between gap-3">
                <Typography align="start" tone="muted">
                  Продолжительность планов
                </Typography>
                <Typography>30 дней</Typography>
              </div>

              <div className="flex justify-between gap-3">
                <Typography align="start" tone="muted">
                  Хранение данных
                </Typography>
                <Typography>LocalStorage</Typography>
              </div>
            </div>
          </Card>
        </section>
      </div>

      <Modal
        open={resetOpen}
        onClose={() => setResetOpen(false)}
        title="Сбросить прогресс?"
        footer={
          <>
            <Button variant="secondary" onClick={() => setResetOpen(false)}>
              Отмена
            </Button>

            <Button variant="danger" onClick={handleReset}>
              Подтвердить сброс
            </Button>
          </>
        }
      >
        <Typography align="start">
          История тренировок, выполнения задач и замеры будут сброшены. Это действие нельзя
          отменить.
        </Typography>
      </Modal>
    </div>
  );
}
