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

  it('микро-паузы и минуты корсета не уходят в минус', () => {
    useProgressStore.getState().setMicroBreaks(1, -3);
    useProgressStore.getState().setCorsetMinutes(1, -10);
    expect(useProgressStore.getState().microBreaks[1]).toBe(0);
    expect(useProgressStore.getState().corsetMinutes[1]).toBe(0);
  });

  it('сохранение замеров отмечает задачу выполненной', () => {
    useProgressStore.getState().saveMeasurement('d01-measure', { weight_kg: '80' });
    expect(useProgressStore.getState().measurements['d01-measure']).toEqual({ weight_kg: '80' });
    expect(useProgressStore.getState().completed['d01-measure']).toBeTruthy();
  });

  it('reset возвращает начальное состояние', () => {
    useProgressStore.getState().toggleTask('x');
    useProgressStore.getState().reset();
    expect(useProgressStore.getState().completed).toEqual({});
  });
});
