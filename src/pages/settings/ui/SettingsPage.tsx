import { levels, userPlanSchema, usePlanStore, type UserPlanData } from '@/entities/plan';
import { useMicroBreakStore, type MicroBreakData } from '@/entities/micro-breaks';
import { useProgressStore, type ProgressData } from '@/entities/progress';
import { DEFAULT_SETTINGS, useSettingsStore, type SettingsData } from '@/entities/settings';
import { Button, Card, Input, Modal, Typography, toast } from '@/shared/ui';
import { useRef, useState } from 'react';

type BackupData = ({ version: 1 } | { version: 2; plan: UserPlanData }) & {
  exportedAt: string;
  progress: ProgressData;
  settings: SettingsData;
  microBreaks?: MicroBreakData;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidDuration(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 1;
}

function isMicroBreakData(value: unknown): value is MicroBreakData {
  if (!isRecord(value) || !Array.isArray(value.items)) {
    return false;
  }

  const ids = new Set<string>();

  for (const item of value.items) {
    if (!isRecord(item)) {
      return false;
    }

    const validItem =
      typeof item.id === 'string' &&
      item.id.trim().length > 0 &&
      typeof item.text === 'string' &&
      item.text.trim().length > 0 &&
      typeof item.durationMinutes === 'number' &&
      Number.isInteger(item.durationMinutes) &&
      item.durationMinutes >= 1 &&
      item.durationMinutes <= 60 &&
      typeof item.enabled === 'boolean' &&
      typeof item.order === 'number' &&
      Number.isInteger(item.order) &&
      item.order >= 0;

    if (!validItem || ids.has(item.id as string)) {
      return false;
    }

    ids.add(item.id as string);
  }

  return true;
}

function validateBackup(value: unknown): value is BackupData {
  if (!isRecord(value) || (value.version !== 1 && value.version !== 2)) {
    return false;
  }

  if (value.version === 2 && !userPlanSchema.safeParse(value.plan).success) {
    return false;
  }

  const { progress, settings, microBreaks } = value;

  if (!isRecord(progress) || !isRecord(settings)) {
    return false;
  }

  const validProgress =
    typeof progress.startDate === 'string' &&
    isRecord(progress.completed) &&
    isRecord(progress.microBreaks);

  const validSettings =
    isRecord(settings.rewards) &&
    (settings.workDurationMin === undefined || isValidDuration(settings.workDurationMin)) &&
    (settings.breakDurationMin === undefined || isValidDuration(settings.breakDurationMin)) &&
    (settings.workLabel === undefined ||
      (typeof settings.workLabel === 'string' && settings.workLabel.trim().length > 0));

  const validMicroBreaks = microBreaks === undefined || isMicroBreakData(microBreaks);

  return validProgress && validSettings && validMicroBreaks;
}

export function SettingsPage() {
  const [resetOpen, setResetOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const rewards = useSettingsStore((state) => state.rewards);
  const setReward = useSettingsStore((state) => state.setReward);

  const replaceProgress = useProgressStore((state) => state.replaceAll);
  const resetProgress = useProgressStore((state) => state.reset);

  const replaceSettings = useSettingsStore((state) => state.replaceAll);
  const replaceMicroBreaks = useMicroBreakStore((state) => state.replaceAll);

  const handleExport = () => {
    const { schemaVersion, template, dayOverrides } = usePlanStore.getState();
    const progressState = useProgressStore.getState();
    const settingsState = useSettingsStore.getState();
    const microBreakState = useMicroBreakStore.getState();

    const backup: BackupData = {
      version: 2,
      plan: { schemaVersion, template, dayOverrides },
      exportedAt: new Date().toISOString(),
      progress: {
        startDate: progressState.startDate,
        completed: progressState.completed,
        microBreaks: progressState.microBreaks,
      },
      settings: {
        rewards: settingsState.rewards,
        workDurationMin: settingsState.workDurationMin,
        breakDurationMin: settingsState.breakDurationMin,
        workLabel: settingsState.workLabel,
      },
      microBreaks: {
        items: microBreakState.items,
      },
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });

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

      if (parsed.version === 2) {
        usePlanStore.getState().replaceAll(parsed.plan);
      }

      replaceProgress({
        startDate: parsed.progress.startDate,
        completed: parsed.progress.completed,
        microBreaks: parsed.progress.microBreaks,
      });

      replaceSettings({
        rewards: parsed.settings.rewards as Record<string, string>,
        workDurationMin: parsed.settings.workDurationMin ?? DEFAULT_SETTINGS.workDurationMin,
        breakDurationMin: parsed.settings.breakDurationMin ?? DEFAULT_SETTINGS.breakDurationMin,
        workLabel: parsed.settings.workLabel ?? DEFAULT_SETTINGS.workLabel,
      });

      if (parsed.microBreaks) {
        replaceMicroBreaks(parsed.microBreaks);
      }

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
          Награды и управление данными
        </Typography>
      </header>

      <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
        <section className="flex min-w-0 flex-col gap-4">
          <Card title="Награды за уровни">
            <Typography align="start" tone="muted" className="text-sm">
              Придумай небольшую награду, которую получишь после достижения каждого уровня.
            </Typography>

            {levels.map((level) => (
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
              Сохрани план с задачами и заметками, прогресс, награды, настройки таймера и микро-паузы в JSON-файл.
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
              Импорт заменит план, прогресс и настройки данными из файла. При импорте старой
              копии без плана текущие задачи и заметки сохранятся.
            </Typography>
          </Card>

          <Card title="Сброс данных" border="1px" borderColor="rgb(239 68 68 / 0.35)">
            <Typography align="start" tone="muted" className="text-sm">
              Удаляет историю выполнения задач и накопленный прогресс. Выбранные награды останутся.
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
          История выполнения задач и накопленный прогресс будут сброшены. Это действие нельзя
          отменить.
        </Typography>
      </Modal>
    </div>
  );
}
