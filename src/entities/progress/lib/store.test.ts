import { beforeEach, describe, expect, it } from 'vitest';
import { createInitialProgress, useProgressStore } from '../model/store';

describe('хранилище прогресса', () => {
  beforeEach(() => {
    useProgressStore.setState({ ...createInitialProgress() });
  });

  it('toggleTask отмечает и снимает задачу', () => {
    expect(useProgressStore.getState().toggleTask('task-1')).toBe(true);
    expect(useProgressStore.getState().completed['task-1']).toBeTruthy();

    expect(useProgressStore.getState().toggleTask('task-1')).toBe(false);
    expect(useProgressStore.getState().completed['task-1']).toBeUndefined();
  });

  it('микро-паузы не уходят в минус', () => {
    useProgressStore.getState().setMicroBreaks(1, -3);

    expect(useProgressStore.getState().microBreaks[1]).toBe(0);
  });

  it('сохраняет количество микро-пауз', () => {
    useProgressStore.getState().setMicroBreaks(1, 3);

    expect(useProgressStore.getState().microBreaks[1]).toBe(3);
  });

  it('reset возвращает начальное состояние', () => {
    useProgressStore.getState().toggleTask('task-1');
    useProgressStore.getState().setMicroBreaks(1, 3);

    useProgressStore.getState().reset();

    expect(useProgressStore.getState().completed).toEqual({});
    expect(useProgressStore.getState().microBreaks).toEqual({});
  });

  it('очищает микро-паузы удалённого дня', () => {
    const { setMicroBreaks, clearMicroBreaks } = useProgressStore.getState();

    setMicroBreaks(7, 5);
    expect(useProgressStore.getState().microBreaks[7]).toBe(5);

    clearMicroBreaks(7);
    expect(useProgressStore.getState().microBreaks[7]).toBeUndefined();

    // Повторное использование номера дня не возвращает старый счётчик.
    setMicroBreaks(7, 1);
    expect(useProgressStore.getState().microBreaks[7]).toBe(1);
  });
});
