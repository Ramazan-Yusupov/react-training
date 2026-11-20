import { useState } from 'react';
import { useUserWorkoutPlanStore } from '@/entities/plan';
import type { WorkoutGroup } from '@/entities/plan';
import { Button, IconButton, Input, Modal } from '@/shared/ui';
import { FaPen, FaPlus, FaTrash } from 'react-icons/fa6';

type EditorMode = 'add' | 'edit' | 'delete' | null;

interface GroupEditorProps {
  day: number;
  group?: WorkoutGroup;
}

export function GroupEditor({ day, group }: GroupEditorProps) {
  const addGroup = useUserWorkoutPlanStore((state) => state.addGroup);
  const updateGroup = useUserWorkoutPlanStore((state) => state.updateGroup);
  const deleteGroup = useUserWorkoutPlanStore((state) => state.deleteGroup);

  const [mode, setMode] = useState<EditorMode>(null);
  const [title, setTitle] = useState(group?.title ?? '');

  const close = () => {
    setMode(null);
    setTitle(group?.title ?? '');
  };

  const handleAdd = () => {
    if (!title.trim()) return;

    addGroup(title);
    setTitle('');
    setMode(null);
  };

  const handleUpdate = (scope: 'day' | 'all') => {
    if (!group || !title.trim()) return;

    updateGroup(day, group.id, title, scope);
    close();
  };

  const handleDelete = (scope: 'day' | 'all') => {
    if (!group) return;

    deleteGroup(day, group.id, scope);
    close();
  };

  if (!group) {
    return (
      <>
        <Button size="sm" variant="outline" icon={<FaPlus />} onClick={() => setMode('add')}>
          Добавить карточку
        </Button>

        <Modal
          open={mode === 'add'}
          onClose={close}
          title="Новая карточка"
          footer={
            <>
              <Button variant="ghost" onClick={close}>
                Отмена
              </Button>
              <Button variant="primary" onClick={handleAdd} disabled={!title.trim()}>
                Создать во всех днях
              </Button>
            </>
          }
        >
          <Input
            label="Название карточки"
            placeholder="Например, Утро"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            autoFocus
            maxLength={40}
          />

          <p className="text-xs text-gray-400">
            Карточка появится во всех 30 днях плана. Содержимое задач можно будет настроить
            отдельно.
          </p>
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
          ariaLabel={`Переименовать карточку ${group.title}`}
          icon={<FaPen />}
          onClick={() => {
            setTitle(group.title);
            setMode('edit');
          }}
        />

        <IconButton
          size="sm"
          variant="ghost"
          ariaLabel={`Удалить карточку ${group.title}`}
          icon={<FaTrash />}
          onClick={() => setMode('delete')}
        />
      </div>

      <Modal open={mode === 'edit'} onClose={close} title="Переименовать карточку">
        <Input
          label="Новое название"
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          maxLength={40}
          autoFocus
        />

        <p className="text-sm text-gray-400">Где применить новое название?</p>

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
            Во всех 30 днях
          </Button>

          <Button variant="ghost" fullWidth onClick={close}>
            Отмена
          </Button>
        </div>
      </Modal>

      <Modal open={mode === 'delete'} onClose={close} title="Удалить карточку?">
        <p className="text-sm text-gray-300">
          Карточка «{group.title}» и её задачи будут удалены из выбранной области. Записи о
          выполнении в истории прогресса автоматически не удаляются.
        </p>

        <div className="flex flex-col gap-2">
          <Button variant="danger" fullWidth onClick={() => handleDelete('day')}>
            Только день {day}
          </Button>

          <Button variant="outline" fullWidth onClick={() => handleDelete('all')}>
            Во всех 30 днях
          </Button>

          <Button variant="ghost" fullWidth onClick={close}>
            Отмена
          </Button>
        </div>
      </Modal>
    </>
  );
}
