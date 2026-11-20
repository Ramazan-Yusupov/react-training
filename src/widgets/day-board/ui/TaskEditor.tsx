import { useState } from 'react';
import { useUserWorkoutPlanStore } from '@/entities/plan';
import type { Task } from '@/entities/plan';
import { Button, Checkbox, IconButton, Input, Modal } from '@/shared/ui';
import { FaPen, FaPlus, FaTrash } from 'react-icons/fa6';

type EditorMode = 'add' | 'edit' | 'delete' | null;

interface TaskEditorProps {
  day: number;
  groupId: string;
  task?: Task;
}

export function TaskEditor({ day, groupId, task }: TaskEditorProps) {
  const addCustomTask = useUserWorkoutPlanStore((state) => state.addCustomTask);
  const updateTask = useUserWorkoutPlanStore((state) => state.updateTask);
  const deleteTask = useUserWorkoutPlanStore((state) => state.deleteTask);

  const currentDay = useUserWorkoutPlanStore(
    (state) =>
      state.dayOverrides[String(day)] ?? state.template.days.find((item) => item.day === day),
  );

  const [mode, setMode] = useState<EditorMode>(null);
  const [title, setTitle] = useState(task?.title ?? '');
  const [durationMin, setDurationMin] = useState(String(task?.durationMin ?? 5));
  const [xp, setXp] = useState(String(task?.xp ?? 5));
  const [required, setRequired] = useState(task?.required ?? false);
  const [error, setError] = useState('');

  const taskCount =
    currentDay?.tasks.filter((item) => item.groupId === groupId && item.type === 'custom').length ??
    0;

  const isLimitReached = taskCount >= 10;

  const close = () => {
    setMode(null);
    setTitle(task?.title ?? '');
    setDurationMin(String(task?.durationMin ?? 5));
    setXp(String(task?.xp ?? 5));
    setRequired(task?.required ?? false);
    setError('');
  };

  const validate = () => {
    const normalizedTitle = title.trim();
    const duration = Number(durationMin);
    const points = Number(xp);

    if (!normalizedTitle) {
      setError('Введите название задачи.');
      return null;
    }

    if (!Number.isInteger(duration) || duration < 1 || duration > 1440) {
      setError('Длительность должна быть от 1 до 1440 минут.');
      return null;
    }

    if (!Number.isInteger(points) || points < 0 || points > 10000) {
      setError('XP должно быть целым числом от 0 до 10000.');
      return null;
    }

    return {
      title: normalizedTitle,
      durationMin: duration,
      xp: points,
      required,
    };
  };

  const handleAdd = (scope: 'day' | 'all') => {
    const values = validate();
    if (!values) return;

    const result = addCustomTask(day, groupId, values, scope);

    if (!result) {
      setError(
        scope === 'all'
          ? 'Не удалось добавить задачу: в одной из карточек уже достигнут лимит в 10 задач.'
          : 'В этой карточке уже есть 10 пользовательских задач.',
      );
      return;
    }

    close();
  };

  const handleUpdate = (scope: 'day' | 'all') => {
    if (!task) return;

    const values = validate();
    if (!values) return;

    updateTask(day, task.id, values, scope);
    close();
  };

  const handleDelete = (scope: 'day' | 'all') => {
    if (!task) return;

    deleteTask(day, task.id, scope);
    close();
  };

  const renderFields = () => (
    <>
      <Input
        label="Название задачи"
        placeholder="Например, Прочитать главу книги"
        value={title}
        onChange={(event) => {
          setTitle(event.target.value);
          setError('');
        }}
        maxLength={100}
        autoFocus
      />

      <div className="grid grid-cols-2 gap-3">
        <Input
          label="Длительность (мин)"
          type="number"
          min={1}
          max={1440}
          value={durationMin}
          onChange={(event) => {
            setDurationMin(event.target.value);
            setError('');
          }}
        />

        <Input
          label="Награда (XP)"
          type="number"
          min={0}
          max={10000}
          value={xp}
          onChange={(event) => {
            setXp(event.target.value);
            setError('');
          }}
        />
      </div>

      <Checkbox
        checked={required}
        onChange={(event) => setRequired(event.target.checked)}
        label="Обязательная задача"
        description="Учитывать задачу как обязательную в плане"
      />

      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
    </>
  );

  if (!task) {
    return (
      <>
        <Button
          size="sm"
          variant="ghost"
          icon={<FaPlus />}
          disabled={isLimitReached}
          onClick={() => setMode('add')}
        >
          {isLimitReached ? 'Лимит задач достигнут' : `Добавить задачу (${taskCount}/10)`}
        </Button>

        <Modal open={mode === 'add'} onClose={close} title="Новая задача" size="lg">
          {renderFields()}

          <p className="text-sm text-gray-400">Где создать задачу?</p>

          <div className="flex flex-col gap-2">
            <Button
              variant="primary"
              fullWidth
              disabled={!title.trim()}
              onClick={() => handleAdd('day')}
            >
              Только день {day}
            </Button>

            <Button
              variant="outline"
              fullWidth
              disabled={!title.trim()}
              onClick={() => handleAdd('all')}
            >
              Во всех днях с этой карточкой
            </Button>

            <Button variant="ghost" fullWidth onClick={close}>
              Отмена
            </Button>
          </div>
        </Modal>
      </>
    );
  }

  return (
    <>
      <div className="flex shrink-0 items-center gap-1">
        <IconButton
          size="sm"
          variant="ghost"
          ariaLabel={`Редактировать задачу ${task.title}`}
          icon={<FaPen />}
          onClick={() => {
            setTitle(task.title);
            setDurationMin(String(task.durationMin));
            setXp(String(task.xp));
            setRequired(task.required);
            setMode('edit');
          }}
        />

        <IconButton
          size="sm"
          variant="ghost"
          ariaLabel={`Удалить задачу ${task.title}`}
          icon={<FaTrash />}
          onClick={() => setMode('delete')}
        />
      </div>

      <Modal open={mode === 'edit'} onClose={close} title="Редактировать задачу" size="lg">
        {renderFields()}

        <p className="text-sm text-gray-400">Где применить изменения?</p>

        <div className="flex flex-col gap-2">
          <Button
            variant="primary"
            fullWidth
            disabled={!title.trim()}
            onClick={() => handleUpdate('day')}
          >
            Только день {day}
          </Button>

          <Button
            variant="outline"
            fullWidth
            disabled={!title.trim()}
            onClick={() => handleUpdate('all')}
          >
            Во всех днях
          </Button>

          <Button variant="ghost" fullWidth onClick={close}>
            Отмена
          </Button>
        </div>
      </Modal>

      <Modal open={mode === 'delete'} onClose={close} title="Удалить задачу?">
        <p className="text-sm text-gray-300">
          Задача «{task.title}» будет удалена из выбранной области. Сохранённые записи о выполнении
          автоматически не удаляются.
        </p>

        <div className="flex flex-col gap-2">
          <Button variant="danger" fullWidth onClick={() => handleDelete('day')}>
            Только день {day}
          </Button>

          <Button variant="outline" fullWidth onClick={() => handleDelete('all')}>
            Во всех днях
          </Button>

          <Button variant="ghost" fullWidth onClick={close}>
            Отмена
          </Button>
        </div>
      </Modal>
    </>
  );
}
