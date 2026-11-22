import { useState } from 'react';
import { usePlanStore } from '@/entities/plan';
import type { PlanGroup } from '@/entities/plan';
import { Button, IconButton, Input, Modal } from '@/shared/ui';
import { FaPen, FaPlus, FaTrash } from 'react-icons/fa6';

type EditorMode = 'add' | 'edit' | 'delete' | null;

interface GroupEditorProps {
  day: number;
  group?: PlanGroup;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  hideTrigger?: boolean;
}

export function GroupEditor({
  day,
  group,
  open,
  onOpenChange,
  hideTrigger = false,
}: GroupEditorProps) {
  const addGroup = usePlanStore((state) => state.addGroup);
  const updateGroup = usePlanStore((state) => state.updateGroup);
  const deleteGroup = usePlanStore((state) => state.deleteGroup);

  const [mode, setMode] = useState<EditorMode>(null);
  const [title, setTitle] = useState(group?.title ?? '');

  const isAddOpen = open ?? mode === 'add';

  const close = () => {
    setMode(null);
    setTitle(group?.title ?? '');
    onOpenChange?.(false);
  };

  const handleAdd = (scope: 'day' | 'all') => {
    if (!title.trim()) return;

    addGroup(day, title, scope);
    setTitle('');
    close();
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
        {!hideTrigger && (
          <Button size="sm" variant="outline" icon={<FaPlus />} onClick={() => setMode('add')}>
            Добавить карточку
          </Button>
        )}

        <Modal open={isAddOpen} onClose={close} title="Новая карточка" size="md">
          <Input
            label="Название карточки"
            placeholder="Например, Учёба"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            autoFocus
            maxLength={40}
          />

          <p className="text-sm text-gray-400">Выбери, где будет отображаться карточка.</p>

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
          variant="dangerGhost"
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
            Во всех днях
          </Button>

          <Button variant="ghost" fullWidth onClick={close}>
            Отмена
          </Button>
        </div>
      </Modal>

      <Modal open={mode === 'delete'} onClose={close} title="Удалить карточку?">
        <p className="text-sm text-gray-300">
          Карточка «{group.title}» и её задачи будут удалены из выбранной области.
        </p>

        <div className="flex flex-col gap-2">
          <Button variant="danger" fullWidth onClick={() => handleDelete('day')}>
            Только день {day}
          </Button>

          <Button variant="dangerOutline" fullWidth onClick={() => handleDelete('all')}>
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
