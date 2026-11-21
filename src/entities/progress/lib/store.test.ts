import { beforeEach, describe, expect, it } from 'vitest';
import { createInitialProgress, useProgressStore } from '../model/store';

describe('хранилище прогресса', () => {
  beforeEach(() => {
    useProgressStore.setState({ ...createInitialProgress() });
  });

  it('toggleTask отмечает и снимает задачу', () => {
    expect(useProgressStore.getState().toggleTask('d01-push-1')).toBe(true);
    expect(useProgressStore.getState().completed['d01-push-1']).toBeTruthy();
    expect(useProgressStore.getState().toggleTask('d01-push-1')).toBe(false);
    expect(useProgressStore.getState().completed['d01-push-1']).toBeUndefined();
  });

  it('микро-паузы не уходят в минус', () => {
    useProgressStore.getState().setMicroBreaks(1, -3);

    expect(useProgressStore.getState().microBreaks[1]).toBe(0);
  });

  it('сохранение замеров отмечает задачу выполненной', () => {
    expect(useProgressStore.getState().completed['d01-measure']).toBeTruthy();
  });

  it('reset возвращает начальное состояние', () => {
    useProgressStore.getState().toggleTask('x');
    useProgressStore.getState().reset();
    expect(useProgressStore.getState().completed).toEqual({});
  });
});
