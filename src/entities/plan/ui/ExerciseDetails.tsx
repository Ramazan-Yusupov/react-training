import { Accordion, Typography } from '@/shared/ui';
import { findExercise } from '../lib/findExercise';

interface ExerciseDetailsProps {
  exerciseRef: string | undefined;
}

/** Раскрывающийся список упражнений для задачи (разминка, блок «Тело»). */
export function ExerciseDetails({ exerciseRef }: ExerciseDetailsProps) {
  const exercise = findExercise(exerciseRef);
  if (!exercise) return null;

  return (
    <Accordion
      items={[
        {
          id: exerciseRef ?? exercise.title,
          title: `Показать упражнения: ${exercise.title}`,
          content: (
            <ul className="flex flex-col gap-2">
              {exercise.items.map((item) => (
                <li key={item.name} className="flex flex-col gap-0.5">
                  <Typography as="span" align="start" className="text-white">
                    {item.dose ? `${item.name} — ${item.dose}` : item.name}
                  </Typography>
                  {item.why && <Typography as="span" align="start" tone="muted" text={item.why} />}
                </li>
              ))}
            </ul>
          ),
        },
      ]}
    />
  );
}
