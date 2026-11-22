import { useState } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { FaPlus, FaXmark } from 'react-icons/fa6';
import type { PlanDay, PlanWidgetType } from '@/entities/plan';
import { Button, IconButton, Select } from '@/shared/ui';
import { GroupEditor } from './GroupEditor';
import { TaskEditor } from './TaskEditor';

interface AddContentMenuProps {
  day: number;
  planDay: PlanDay;
  onAddWidget: (type: PlanWidgetType, scope: 'day' | 'all') => void;
}

const widgets: Record<PlanWidgetType, string> = {
  'next-task': 'Следующая задача',
  'micro-breaks': 'Микро-паузы',
  'xp-by-days': 'XP по дням',
  'day-notes': 'Заметки дня',
};

export function AddContentMenu({ day, planDay, onAddWidget }: AddContentMenuProps) {
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState('Задача');
  const [widget, setWidget] = useState<PlanWidgetType>('micro-breaks');
  const [groupId, setGroupId] = useState('');
  const [editor, setEditor] = useState<'task' | 'group' | null>(null);

  function changeOpen(value: boolean) {
    if (value) {
      setKind('Задача');
      setWidget('micro-breaks');
      setGroupId('');
    }
    setOpen(value);
  }

  function addWidget(scope: 'day' | 'all') {
    onAddWidget(widget, scope);
    setOpen(false);
  }

  return (
    <>
      <Dialog.Root open={open} onOpenChange={changeOpen}>
        <Dialog.Trigger asChild>
          <Button
            size="md"
            variant="outline"
            icon={<FaPlus />}
            fullWidth
            aria-label="Добавить карточку, виджет, задачу"
          >
            <span>
              Добавить<span className="hidden sm:inline"> карточку, виджет, задачу</span>
            </span>
          </Button>
        </Dialog.Trigger>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm" />
          <Dialog.Content
            aria-describedby={undefined}
            onCloseAutoFocus={(event) => {
              if (editor) event.preventDefault();
            }}
            className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[90dvh] w-full max-w-md flex-col gap-4 overflow-y-auto rounded-t-2xl border border-white/10 bg-neutral-900 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-white sm:inset-x-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:rounded-2xl"
          >
            <div className="flex items-center justify-between">
              <Dialog.Title className="text-lg font-medium">Что добавить?</Dialog.Title>
              <Dialog.Close asChild>
                <IconButton size="sm" variant="ghost" ariaLabel="Закрыть" icon={<FaXmark />} />
              </Dialog.Close>
            </div>
            <div role="group" aria-label="Тип содержимого" className="grid grid-cols-3 gap-1">
              {['Задача', 'Карточка', 'Виджет'].map((item) => (
                <Button
                  key={item}
                  size="sm"
                  aria-pressed={kind === item}
                  variant={kind === item ? 'primary' : 'outline'}
                  onClick={() => setKind(item)}
                >
                  {item}
                </Button>
              ))}
            </div>
            {kind === 'Виджет' ? (
              <>
                <div role="group" aria-label="Выбери виджет" className="grid gap-2">
                  {(Object.keys(widgets) as PlanWidgetType[]).map((type) => (
                    <Button
                      key={type}
                      variant={widget === type ? 'primary' : 'outline'}
                      aria-pressed={widget === type}
                      onClick={() => setWidget(type)}
                    >
                      {widgets[type]}
                    </Button>
                  ))}
                </div>
                <fieldset className="grid gap-2">
                  <legend className="mb-2 text-sm text-gray-300">Где добавить виджет?</legend>
                  <Button onClick={() => addWidget('day')}>Только день {day}</Button>
                  <Button variant="outline" onClick={() => addWidget('all')}>
                    Во всех днях
                  </Button>
                </fieldset>
              </>
            ) : (
              <>
                {kind === 'Задача' && (
                  <Select
                    label="Куда добавить задачу"
                    value={groupId}
                    onChange={(e) => setGroupId(e.target.value)}
                    options={[
                      { value: '', label: 'Самостоятельная задача' },
                      ...planDay.groups.map((group) => ({ value: group.id, label: group.title })),
                    ]}
                  />
                )}
                <Button
                  variant="primary"
                  onClick={() => {
                    setOpen(false);
                    setEditor(kind === 'Задача' ? 'task' : 'group');
                  }}
                >
                  {kind === 'Задача' ? 'Создать задачу' : 'Создать карточку'}
                </Button>
              </>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
      <GroupEditor
        day={day}
        open={editor === 'group'}
        onOpenChange={(value) => setEditor(value ? 'group' : null)}
        hideTrigger
      />
      <TaskEditor
        day={day}
        groupId={groupId || undefined}
        open={editor === 'task'}
        onOpenChange={(value) => setEditor(value ? 'task' : null)}
        hideTrigger
      />
    </>
  );
}
