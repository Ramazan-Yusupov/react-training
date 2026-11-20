import { exercises } from '../model/plans';

export interface ExerciseView {
  title: string;
  items: { name: string; dose: string; why: string }[];
}

/** Находит упражнения по ссылке `exerciseRef` из задачи плана. */
export function findExercise(ref: string | undefined): ExerciseView | null {
  if (!ref) return null;

  const warmup = exercises.warmups.find((item) => item.id === ref);
  if (warmup) return { title: warmup.title, items: warmup.items };

  const block = exercises.bodyBlocks.find((item) => item.id === ref);
  if (block) return { title: block.title, items: block.items };

  if (ref === 'postureTrainingStructure') {
    return {
      title: 'Структура тренировки',
      items: exercises.postureTrainingStructure.map((step) => ({
        name: `${step.start}–${step.end}`,
        dose: '',
        why: step.text,
      })),
    };
  }

  return null;
}
