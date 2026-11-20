// @vitest-environment jsdom
import { createInitialProgress, useProgressStore } from '@/entities/progress';
import { DEFAULT_SETTINGS, useSettingsStore } from '@/entities/settings';
import { todayISO } from '@/shared/lib';
import { Toaster } from '@/shared/ui';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TodayPage } from './TodayPage';

const renderDay1 = () =>
  render(
    <MemoryRouter initialEntries={['/?day=1']}>
      <TodayPage />
      <Toaster />
    </MemoryRouter>,
  );

beforeEach(() => {
  useProgressStore.setState({ ...createInitialProgress(), startDate: todayISO() });
  useSettingsStore.setState({ ...DEFAULT_SETTINGS });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('страница «Сегодня»', () => {
  it('показывает день 1 и его задачи', () => {
    renderDay1();
    expect(screen.getByText('День 1 из 30')).toBeTruthy();
    expect(screen.getByLabelText(/Отжимания, подход 1/)).toBeTruthy();
    expect(screen.getByLabelText(/Турник/)).toBeTruthy();
    expect(screen.queryByText(/План начнётся/)).toBeNull();
  });

  it('отметка задачи сохраняется, очки и уведомление появляются', () => {
    renderDay1();
    fireEvent.click(screen.getByLabelText(/Отжимания, подход 1/));
    expect(useProgressStore.getState().completed['d01-push-1']).toBeTruthy();
    expect(screen.getByText('За день: 10 XP')).toBeTruthy();
    expect(screen.getByText(/\+10 XP: Отжимания, подход 1/)).toBeTruthy();
  });

  it('все обязательные задачи закрывают день и дают бонус', () => {
    renderDay1();
    for (const label of [
      /Разминка для отжиманий/,
      /Отжимания, подход 1/,
      /Отжимания, подход 2/,
      /Отжимания, подход 3/,
      /Турник/,
    ]) {
      const boxes = screen.getAllByLabelText(label);
      fireEvent.click(boxes[0]!);
    }
    expect(screen.getByText(/День закрыт, бонус \+10 XP/)).toBeTruthy();
    // 5 + 10 + 10 + 10 + 20 + бонус 10
    expect(screen.getByText('65 XP')).toBeTruthy();
    expect(screen.getByText('Серия: 1')).toBeTruthy();
  });

  it('микро-паузы: плюс увеличивает счётчик и очки', () => {
    renderDay1();
    fireEvent.click(screen.getByLabelText('Добавить микро-паузу'));
    fireEvent.click(screen.getByLabelText('Добавить микро-паузу'));
    expect(useProgressStore.getState().microBreaks[1]).toBe(2);
    expect(screen.getByText('2 из 8')).toBeTruthy();
    expect(screen.getByText('За день: 4 XP')).toBeTruthy();
    fireEvent.click(screen.getByLabelText('Убрать микро-паузу'));
    expect(useProgressStore.getState().microBreaks[1]).toBe(1);
  });

  it('план осанки: старт, время корсета от начала работы и журнал минут', () => {
    renderDay1();
    fireEvent.click(screen.getByText('Начать план осанки сегодня'));
    expect(screen.getByText('Осанка: день 1 из 30')).toBeTruthy();
    expect(screen.getByText(/09:00–10:00/)).toBeTruthy();

    act(() => useSettingsStore.getState().setWorkStartHour(9));
    expect(screen.getByText(/10:00–11:00/)).toBeTruthy();

    fireEvent.change(screen.getByLabelText('Сколько минут носил корсет'), {
      target: { value: '45' },
    });
    expect(useProgressStore.getState().corsetMinutes[1]).toBe(45);
  });

  it('замеры: форма сохраняется и отмечает задачу', () => {
    renderDay1();
    fireEvent.click(screen.getByRole('button', { name: /Стартовые замеры/ }));
    fireEvent.change(screen.getByLabelText(/^Вес/), { target: { value: '80' } });
    fireEvent.click(screen.getByText('Сохранить'));
    expect(useProgressStore.getState().measurements['d01-measure']).toEqual({ weight_kg: '80' });
    expect(useProgressStore.getState().completed['d01-measure']).toBeTruthy();
  });

  it('таймер 50/10: идёт по часам', () => {
    vi.useFakeTimers();
    renderDay1();
    expect(screen.getByText('50:00')).toBeTruthy();
    fireEvent.click(screen.getByText('Старт'));
    act(() => vi.advanceTimersByTime(3000));
    expect(screen.getByText('49:57')).toBeTruthy();
    fireEvent.click(screen.getByText('Пауза'));
  });

  it('кубик: бросок показывает упражнение, «Сделал» засчитывает паузу', () => {
    renderDay1();
    fireEvent.click(screen.getByText('Кубик'));
    fireEvent.click(screen.getByText('Бросить кубик'));
    fireEvent.click(screen.getByText('Сделал'));
    expect(useProgressStore.getState().microBreaks[1]).toBe(1);
  });

  it('план ещё не начался: баннер и кнопка «Начать сегодня»', () => {
    useProgressStore.setState({ startDate: '2999-01-01' });
    renderDay1();
    expect(screen.getByText(/План начнётся 01.01/)).toBeTruthy();
    fireEvent.click(screen.getByText('Начать сегодня'));
    expect(useProgressStore.getState().startDate).toBe(todayISO());
  });
});
