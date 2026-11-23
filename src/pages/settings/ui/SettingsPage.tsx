import { levels } from '@/entities/plan';
import { useProgressStore } from '@/entities/progress';
import { useSettingsStore } from '@/entities/settings';
import { snapshot, restore, validateBackup } from '@/features/backup';
import { Button, Card, Input, Modal, Typography, toast } from '@/shared/ui';
import { useRef, useState } from 'react';

export function SettingsPage() {
  const [resetOpen, setResetOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const rewards = useSettingsStore((state) => state.rewards);
  const setReward = useSettingsStore((state) => state.setReward);

  const resetProgress = useProgressStore((state) => state.reset);

  const handleExport = () => {
    const backup = snapshot();

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

      restore(parsed);
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
              Сохрани план с задачами и заметками, прогресс, награды, настройки таймера и
              микро-паузы в JSON-файл.
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
              Импорт заменит план, прогресс и настройки данными из файла. При импорте старой копии
              без плана текущие задачи и заметки сохранятся.
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
