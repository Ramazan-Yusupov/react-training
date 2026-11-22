import { useEffect, useState } from 'react';

import type { PlanWidget } from '@/entities/plan';
import { usePlanStore } from '@/entities/plan';

import { MicroBreaks } from '@/widgets/micro-breaks';
import { XpWeekChart } from '@/widgets/xp-week-chart';

import { MicroBreaksEditor } from '@/features/manage-micro-breaks';

import { Button, Card, IconButton, Modal, Typography } from '@/shared/ui';
import { FaPen, FaTrash } from 'react-icons/fa6';

interface PlanWidgetItemProps {
  day: number;
  widget: PlanWidget;
}

export function PlanWidgetItem({ day, widget }: PlanWidgetItemProps) {
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [isMicroBreakEditorOpen, setIsMicroBreakEditorOpen] = useState(false);
  const [isNotesEditorOpen, setIsNotesEditorOpen] = useState(false);
  const [notesDraft, setNotesDraft] = useState(widget.notes);

  const deleteWidget = usePlanStore((state) => state.deleteWidget);
  const updateWidgetNotes = usePlanStore((state) => state.updateWidgetNotes);

  const title =
    widget.type === 'micro-breaks'
      ? 'Микро-паузы'
      : widget.type === 'xp-by-days'
        ? 'XP по дням'
        : 'Заметки дня';

  useEffect(() => {
    setNotesDraft(widget.notes);
  }, [day, widget.id, widget.notes]);

  useEffect(() => {
    if (widget.type !== 'day-notes' || notesDraft === widget.notes) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      updateWidgetNotes(day, widget.id, notesDraft);
    }, 500);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [day, widget.id, widget.type, widget.notes, notesDraft, updateWidgetNotes]);

  const handleDelete = (scope: 'day' | 'all') => {
    deleteWidget(day, widget.id, scope);
    setIsEditorOpen(false);
  };

  const openMicroBreakEditor = () => {
    setIsEditorOpen(false);
    setIsMicroBreakEditorOpen(true);
  };

  const openSettings = () => setIsEditorOpen(true);

  const handleClearNotes = () => {
    setNotesDraft('');
  };

  return (
    <div className="flex min-w-0 flex-col gap-2">
      {widget.type === 'micro-breaks' && <MicroBreaks day={day} onSettingsClick={openSettings} />}

      {widget.type === 'xp-by-days' && <XpWeekChart day={day} onSettingsClick={openSettings} />}

      {widget.type === 'day-notes' && (
        <Card classNameMain="border-2 border-dotted border-amber-600 rounded-2xl p-4 pl-10">
          <div className="flex items-center justify-between gap-3">
            <Typography
              as="h6"
              align="start"
              tone="accent"
              text={title}
              className="min-w-0 truncate"
            />

            <div className="flex shrink-0 items-center gap-2">
              <IconButton
                size="sm"
                variant="ghost"
                ariaLabel="Редактировать заметки дня"
                icon={<FaPen />}
                onClick={() => setIsNotesEditorOpen(true)}
              />

              <IconButton
                size="sm"
                variant="ghost"
                ariaLabel="Удалить виджет заметок дня"
                icon={<FaTrash />}
                onClick={openSettings}
              />
            </div>
          </div>

          <div className="mt-3">
            {widget.notes.trim() ? (
              <p className="whitespace-pre-wrap wrap-anywhere text-sm text-slate-300">
                {widget.notes}
              </p>
            ) : (
              <Typography align="start" tone="muted">
                Пока нет заметок. Нажми «Редактировать», чтобы добавить текст.
              </Typography>
            )}
          </div>
        </Card>
      )}

      <Modal
        open={isEditorOpen}
        onClose={() => setIsEditorOpen(false)}
        title={`Настройки: ${title}`}
      >
        <div className="flex flex-col gap-3">
          <Typography align="start" tone="muted">
            Управление виджетом
          </Typography>

          {widget.type === 'micro-breaks' && (
            <Button fullWidth variant="primary" onClick={openMicroBreakEditor}>
              Редактировать список микро-пауз
            </Button>
          )}

          <div className="my-1 border-t border-white/10" />

          <Button fullWidth variant="danger" onClick={() => handleDelete('day')}>
            Удалить из этого дня
          </Button>

          <Button fullWidth variant="outline" onClick={() => handleDelete('all')}>
            Удалить из всех дней
          </Button>

          <Button variant="ghost" fullWidth onClick={() => setIsEditorOpen(false)}>
            Отмена
          </Button>
        </div>
      </Modal>

      <Modal
        open={isMicroBreakEditorOpen}
        onClose={() => setIsMicroBreakEditorOpen(false)}
        title="Редактор микро-пауз"
        size="lg"
      >
        <MicroBreaksEditor />
      </Modal>

      <Modal
        open={isNotesEditorOpen}
        onClose={() => setIsNotesEditorOpen(false)}
        title="Заметки дня"
        size="lg"
      >
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-2">
            <span className="text-sm font-medium text-slate-300">Текст заметки</span>

            <textarea
              value={notesDraft}
              onChange={(event) => setNotesDraft(event.target.value)}
              placeholder="Запиши важные мысли, планы или итоги дня..."
              rows={8}
              className="w-full resize-y rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-slate-100 outline-none transition focus:border-blue-500"
            />
          </label>

          <Typography align="start" tone="muted">
            Изменения сохраняются автоматически.
          </Typography>

          <div className="flex flex-col gap-2">
            <Button fullWidth variant="outline" onClick={handleClearNotes} disabled={!notesDraft}>
              Очистить заметки
            </Button>

            <Button fullWidth variant="primary" onClick={() => setIsNotesEditorOpen(false)}>
              Готово
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
