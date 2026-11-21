import { useMicroBreakStore, type MicroBreak } from '@/entities/micro-breaks';
import {
  Button,
  Card,
  IconButton,
  Input,
  Modal,
  Switch,
  Textarea,
  Typography,
  toast,
} from '@/shared/ui';
import { useState, type FormEvent } from 'react';
import { FaArrowDown, FaArrowUp, FaPen, FaPlus, FaTrash } from 'react-icons/fa6';

interface MicroBreakDraft {
  text: string;
  durationMinutes: string;
}

const initialDraft: MicroBreakDraft = {
  text: '',
  durationMinutes: '2',
};

const MIN_DURATION = 1;
const MAX_DURATION = 60;

export function MicroBreaksEditor() {
  const items = useMicroBreakStore((state) => state.items);
  const addBreak = useMicroBreakStore((state) => state.addBreak);
  const updateBreak = useMicroBreakStore((state) => state.updateBreak);
  const removeBreak = useMicroBreakStore((state) => state.removeBreak);
  const toggleBreak = useMicroBreakStore((state) => state.toggleBreak);
  const reorderBreaks = useMicroBreakStore((state) => state.reorderBreaks);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draft, setDraft] = useState<MicroBreakDraft>(initialDraft);

  const sortedItems = [...items].sort((a, b) => a.order - b.order);
  const editingItem = sortedItems.find((item) => item.id === editingId);

  const openCreateModal = () => {
    setEditingId(null);
    setDraft(initialDraft);
    setModalOpen(true);
  };

  const openEditModal = (item: MicroBreak) => {
    setEditingId(item.id);
    setDraft({
      text: item.text,
      durationMinutes: String(item.durationMinutes),
    });
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setDraft(initialDraft);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const text = draft.text.trim();
    const duration = Number(draft.durationMinutes);

    if (!text) {
      toast.error('Введите описание микро-паузы');
      return;
    }

    if (!Number.isInteger(duration) || duration < MIN_DURATION || duration > MAX_DURATION) {
      toast.error(`Длительность должна быть от ${MIN_DURATION} до ${MAX_DURATION} минут`);
      return;
    }

    if (editingId) {
      updateBreak(editingId, {
        text,
        durationMinutes: duration,
      });

      toast.success('Микро-пауза обновлена');
    } else {
      const id = addBreak({
        text,
        durationMinutes: duration,
      });

      if (!id) {
        toast.error('Не удалось добавить микро-паузу');
        return;
      }

      toast.success('Микро-пауза добавлена');
    }

    closeModal();
  };

  const handleRemove = (item: MicroBreak) => {
    removeBreak(item.id);
    toast.success('Микро-пауза удалена');
  };

  const handleMove = (item: MicroBreak, direction: -1 | 1) => {
    const currentIndex = sortedItems.findIndex((entry) => entry.id === item.id);

    if (currentIndex === -1) {
      return;
    }

    const targetIndex = currentIndex + direction;

    if (targetIndex < 0 || targetIndex >= sortedItems.length) {
      return;
    }

    const nextItems = [...sortedItems];

    const currentItem = nextItems[currentIndex];
    const targetItem = nextItems[targetIndex];

    if (!currentItem || !targetItem) {
      return;
    }

    nextItems[currentIndex] = targetItem;
    nextItems[targetIndex] = currentItem;

    reorderBreaks(nextItems.map((entry) => entry.id));
  };

  return (
    <>
      <Card
        title="Микро-паузы"
        headerRight={
          <Button size="sm" variant="primary" icon={<FaPlus />} onClick={openCreateModal}>
            Добавить
          </Button>
        }
      >
        <Typography align="start" tone="muted" className="text-sm">
          Создавай собственные варианты пауз, меняй их длительность и порядок. Отключённые варианты
          не будут использоваться в кубике.
        </Typography>

        {sortedItems.length === 0 ? (
          <div className="rounded-xl border border-dashed border-white/20 p-5 text-center">
            <Typography tone="muted">Список пока пуст. Добавь первую микро-паузу.</Typography>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {sortedItems.map((item, index) => (
              <div
                key={item.id}
                className="flex min-w-0 flex-col gap-3 rounded-xl border border-white/10 p-3 sm:flex-row sm:items-center"
              >
                <div className="flex min-w-0 flex-1 flex-col gap-1">
                  <Typography align="start" className={item.enabled ? '' : 'text-gray-500'}>
                    {item.text}
                  </Typography>

                  <Typography align="start" tone="muted" className="text-xs">
                    {item.durationMinutes} мин.
                    {!item.enabled && ' · Отключена'}
                  </Typography>
                </div>

                <div className="flex flex-wrap items-center gap-1">
                  <Switch
                    checked={item.enabled}
                    onChange={() => toggleBreak(item.id)}
                    aria-label={`Включить или отключить: ${item.text}`}
                  />

                  <IconButton
                    size="sm"
                    variant="ghost"
                    ariaLabel="Переместить вверх"
                    icon={<FaArrowUp />}
                    disabled={index === 0}
                    onClick={() => handleMove(item, -1)}
                  />

                  <IconButton
                    size="sm"
                    variant="ghost"
                    ariaLabel="Переместить вниз"
                    icon={<FaArrowDown />}
                    disabled={index === sortedItems.length - 1}
                    onClick={() => handleMove(item, 1)}
                  />

                  <IconButton
                    size="sm"
                    variant="ghost"
                    ariaLabel="Редактировать микро-паузу"
                    icon={<FaPen />}
                    onClick={() => openEditModal(item)}
                  />

                  <IconButton
                    size="sm"
                    variant="ghost"
                    ariaLabel="Удалить микро-паузу"
                    icon={<FaTrash />}
                    className="text-red-400 hover:text-red-300"
                    onClick={() => handleRemove(item)}
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Modal
        open={modalOpen}
        onClose={closeModal}
        title={editingItem ? 'Редактировать микро-паузу' : 'Новая микро-пауза'}
        footer={
          <>
            <Button variant="secondary" onClick={closeModal}>
              Отмена
            </Button>

            <Button
              variant="primary"
              onClick={() => {
                const form = document.getElementById('micro-break-form');

                if (form instanceof HTMLFormElement) {
                  form.requestSubmit();
                }
              }}
            >
              Сохранить
            </Button>
          </>
        }
      >
        <form id="micro-break-form" className="flex flex-col gap-4" onSubmit={handleSubmit}>
          <Textarea
            label="Описание"
            placeholder="Например: немного пройтись и размяться"
            value={draft.text}
            onChange={(event) => setDraft((state) => ({ ...state, text: event.target.value }))}
            rows={3}
            required
            autoFocus
          />

          <Input
            label="Длительность (минуты)"
            type="number"
            min={MIN_DURATION}
            max={MAX_DURATION}
            step={1}
            value={draft.durationMinutes}
            onChange={(event) =>
              setDraft((state) => ({
                ...state,
                durationMinutes: event.target.value,
              }))
            }
            required
          />
        </form>
      </Modal>
    </>
  );
}
