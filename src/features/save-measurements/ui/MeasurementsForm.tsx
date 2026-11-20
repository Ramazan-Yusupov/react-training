import type { Task } from '@/entities/plan';
import { useProgressStore } from '@/entities/progress';
import { Button, Input, Textarea, toast } from '@/shared/ui';
import { useState } from 'react';
import { MEASUREMENT_FIELDS } from '../model/fields';

interface MeasurementsFormProps {
  task: Task;
  onDone: () => void;
}

export function MeasurementsForm({ task, onDone }: MeasurementsFormProps) {
  const saved = useProgressStore((state) => state.measurements[task.id]);
  const saveMeasurement = useProgressStore((state) => state.saveMeasurement);
  const [values, setValues] = useState<Record<string, string>>(saved ?? {});

  const fieldKeys = (task.fields ?? []).filter((key) => key in MEASUREMENT_FIELDS);

  const submit = () => {
    saveMeasurement(task.id, values);
    toast.success(`+${task.xp} XP: замеры сохранены`);
    onDone();
  };

  return (
    <div className="flex flex-col gap-4">
      {fieldKeys.map((key) => {
        const field = MEASUREMENT_FIELDS[key];
        return (
          <Input
            key={key}
            type="number"
            inputMode="decimal"
            label={`${field?.label ?? key}, ${field?.unit ?? ''}`}
            value={values[key] ?? ''}
            onChange={(event) => setValues((prev) => ({ ...prev, [key]: event.target.value }))}
          />
        );
      })}
      <Textarea
        label="Заметка"
        placeholder="Самочувствие, что получилось, что нет"
        value={values.note ?? ''}
        onChange={(event) => setValues((prev) => ({ ...prev, note: event.target.value }))}
      />
      <div className="flex justify-end gap-2">
        <Button title="Отмена" onClick={onDone} />
        <Button variant="primary" title="Сохранить" onClick={submit} />
      </div>
    </div>
  );
}
