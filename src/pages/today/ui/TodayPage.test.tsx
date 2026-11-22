// @vitest-environment jsdom

import { createInitialProgress, useProgressStore } from '@/entities/progress';
import { useMicroBreakStore } from '@/entities/micro-breaks';
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
  useProgressStore.setState({
    ...createInitialProgress(),
    startDate: todayISO(),
  });

  useSettingsStore.setState({ ...DEFAULT_SETTINGS });

  useMicroBreakStore.getState().reset();
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe('страница «Сегодня»', () => {
  it('показывает первый день и стартовую задачу', () => {
    renderDay1();

    expect(screen.getByText('День 1 из 30')).toBeTruthy();
    expect(screen.getByText('Создать план')).toBeTruthy();
    expect(screen.queryByText(/Отжимания/)).toBeNull();
    expect(screen.queryByText(/Турник/)).toBeNull();
    expect(screen.queryByText(/План начнётся/)).toBeNull();
  });

  it('отметка стартовой задачи сохраняется и начисляет XP', () => {
    renderDay1();

    fireEvent.click(screen.getByRole('checkbox', { name: /Создать план/ }));

    const completed = Object.values(useProgressStore.getState().completed);

    expect(completed.length).toBe(1);
    expect(completed[0]).toBeTruthy();
    expect(screen.getByText('За день: 15 XP')).toBeTruthy();
  });

  it('выполнение обязательной задачи закрывает день', () => {
    renderDay1();

    fireEvent.click(screen.getByRole('checkbox', { name: /Создать план/ }));

    expect(screen.getByText(/1 из 1/)).toBeTruthy();
    expect(screen.getByText('За день: 15 XP')).toBeTruthy();
  });

  it('виджет микро-пауз добавляется и засчитывает выполнение', () => {
    renderDay1();

    fireEvent.click(screen.getByRole('button', { name: 'Добавить карточку, виджет, задачу' }));

    fireEvent.click(screen.getByRole('button', { name: 'Виджет' }));
    fireEvent.click(screen.getByRole('button', { name: 'Микро-паузы' }));
    fireEvent.click(screen.getByRole('button', { name: 'Только день 1' }));

    fireEvent.click(screen.getByText('Бросить кубик'));

    const enabledBreaks = useMicroBreakStore.getState().items.filter((item) => item.enabled);

    expect(enabledBreaks.length).toBeGreaterThan(0);

    const visibleBreak = enabledBreaks.find((item) => screen.queryByText(item.text) !== null);

    expect(visibleBreak).toBeTruthy();

    fireEvent.click(screen.getByText('Сделал'));

    expect(useProgressStore.getState().microBreaks[1]).toBe(1);
    expect(screen.getByText('+2 XP')).toBeTruthy();
  });

  it('таймер 50/10 работает по часам', () => {
    vi.useFakeTimers();

    renderDay1();

    expect(screen.getByText('50:00')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Старт' }));

    act(() => {
      vi.advanceTimersByTime(3000);
    });

    expect(screen.getByText('49:57')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Пауза' }));
  });
});
