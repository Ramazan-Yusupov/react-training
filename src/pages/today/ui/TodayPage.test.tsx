// @vitest-environment jsdom

import { createInitialProgress, useProgressStore } from '@/entities/progress';
import { usePlanStore } from '@/entities/plan';
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
  usePlanStore.getState().reset();
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

    const visibleBreak = enabledBreaks.find((item) =>
      screen.queryAllByText(item.text).some((element) => !element.closest('dialog:not([open])')),
    );

    expect(visibleBreak).toBeTruthy();

    fireEvent.click(screen.getByText('Сделал'));

    expect(useProgressStore.getState().microBreaks[1]).toBe(1);
    expect(screen.getByText('+2 XP')).toBeTruthy();
  });

  it('запускает ближайшую задачу и отмечает её только после подтверждения', () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 22, 8, 55));
    useProgressStore.setState({ startDate: todayISO() });
    const plan = usePlanStore.getState();
    plan.addTask(1, null, { title: 'Поздняя', scheduledTime: '10:00' }, 'day');
    plan.addTask(
      1,
      null,
      { title: 'Ближайшая', scheduledTime: '09:00', durationMin: 1, xp: 87 },
      'day',
    );
    plan.addWidget(1, 'next-task', 'day');
    renderDay1();
    fireEvent.click(screen.getByRole('button', { name: 'Начать фокус' }));
    expect(screen.getByText('01:00')).toBeTruthy();
    act(() => vi.advanceTimersByTime(60000));
    expect(Object.keys(useProgressStore.getState().completed)).toHaveLength(0);
    fireEvent.click(screen.getByRole('button', { name: 'Отметить выполненной' }));
    expect(screen.getByText('За день: 87 XP')).toBeTruthy();
    expect(Object.keys(useProgressStore.getState().completed)).toHaveLength(1);
  });

  it('берёт название из задачи, а после сброса позволяет переименовать ручной фокус', () => {
    useSettingsStore.getState().setFocusTimerLabel('Проект');
    usePlanStore.getState().addWidget(1, 'next-task', 'day');
    renderDay1();
    const click = (name: string) => fireEvent.click(screen.getByRole('button', { name }));
    const nameInput = () => screen.getByRole<HTMLInputElement>('textbox', { name: 'Название режима работы' });

    click('Начать фокус');
    expect(screen.queryByText('Проект')).toBeNull();
    click('Настройки');
    expect(nameInput().value).toBe('Создать план');
    expect(nameInput().disabled).toBe(true);
    click('Сохранить');
    click('Сброс');
    expect(screen.getByText('Проект')).toBeTruthy();
    click('Старт');
    click('Настройки');
    expect(nameInput().disabled).toBe(false);
    fireEvent.change(nameInput(), { target: { value: 'Учёба' } });
    click('Сохранить');
    expect(screen.getByText('Учёба')).toBeTruthy();
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
