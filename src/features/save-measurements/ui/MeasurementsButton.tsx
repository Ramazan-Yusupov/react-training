import type { Task } from '@/entities/plan';
import { useProgressStore } from '@/entities/progress';
import { Button, Modal } from '@/shared/ui';
import { useState } from 'react';
import { FaRuler } from 'react-icons/fa6';
import { MeasurementsForm } from './MeasurementsForm';

interface MeasurementsButtonProps {
  task: Task;
}

/** Кнопка «Замеры» и окно с полями из задачи (вес, талия, максимумы). */
export function MeasurementsButton({ task }: MeasurementsButtonProps) {
  const [open, setOpen] = useState(false);
  const isSaved = useProgressStore((state) => Boolean(state.completed[task.id]));

  return (
    <>
      <Button
        variant={isSaved ? 'outline' : 'primary'}
        icon={<FaRuler />}
        title={isSaved ? 'Замеры сохранены, изменить' : task.title}
        onClick={() => setOpen(true)}
      />
      <Modal open={open} onClose={() => setOpen(false)} title={task.title}>
        {open && <MeasurementsForm task={task} onDone={() => setOpen(false)} />}
      </Modal>
    </>
  );
}
