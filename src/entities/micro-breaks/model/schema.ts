export interface MicroBreak {
  id: string;
  text: string;
  durationMinutes: number;
  enabled: boolean;
  order: number;
}

export interface MicroBreakData {
  items: MicroBreak[];
}

export type CreateMicroBreakInput = Pick<MicroBreak, 'text'> &
  Partial<Pick<MicroBreak, 'durationMinutes'>>;

export type UpdateMicroBreakInput = Partial<
  Pick<MicroBreak, 'text' | 'durationMinutes' | 'enabled'>
>;

export const createInitialMicroBreaks = (): MicroBreakData => ({
  items: [
    {
      id: 'micro-break-1',
      text: 'Встань и немного пройдись.',
      durationMinutes: 2,
      enabled: true,
      order: 0,
    },
    {
      id: 'micro-break-2',
      text: 'Переведи взгляд вдаль и отдохни от экрана.',
      durationMinutes: 2,
      enabled: true,
      order: 1,
    },
    {
      id: 'micro-break-3',
      text: 'Расслабь плечи и измени положение тела.',
      durationMinutes: 2,
      enabled: true,
      order: 2,
    },
    {
      id: 'micro-break-4',
      text: 'Сделай несколько спокойных глубоких вдохов.',
      durationMinutes: 2,
      enabled: true,
      order: 3,
    },
    {
      id: 'micro-break-5',
      text: 'Выпей воды и немного отдохни.',
      durationMinutes: 2,
      enabled: true,
      order: 4,
    },
    {
      id: 'micro-break-6',
      text: 'Отведи взгляд от экрана и дай глазам отдохнуть.',
      durationMinutes: 2,
      enabled: true,
      order: 5,
    },
  ],
});
