// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { afterEach, expect, it, vi } from 'vitest';
import { useProgressStore } from '@/entities/progress';
import { AccountWorkspace } from './AccountWorkspace';

const db = vi.hoisted(() => {
  let row: Record<string, unknown> | null = null;
  const query = {
    eq: () => query, select: () => query,
    maybeSingle: async () => ({ data: row, error: null }),
    single: async () => ({ data: row, error: null }),
    insert: (values: Record<string, unknown>) => { row = values; return query; },
    update: (values: Record<string, unknown>) => { row = { ...row, ...values }; return query; },
  };
  return { from: () => query };
});
vi.mock('@/shared/config/supabase', () => ({ supabase: db }));
vi.mock('./useAccount', () => ({ useAccount: () => ({ id: 'account-a' }) }));
afterEach(cleanup);

it('сохраняет отметку в аккаунте и восстанавливает её при следующем входе отдельно от гостя', async () => {
  const view = () => <AccountWorkspace><button onClick={() => useProgressStore.getState().toggleTask('task-a')}>Отметить</button></AccountWorkspace>;
  const first = render(view());
  fireEvent.click(await screen.findByText('Перенести план этого браузера'));
  fireEvent.click(await screen.findByText('Отметить'));
  await waitFor(() => expect(sessionStorage.getItem('planer-pending-v1:account-a')).toBeNull());
  first.unmount();
  expect(useProgressStore.getState().completed['task-a']).toBeUndefined();
  render(view());
  await screen.findByText('Отметить');
  expect(useProgressStore.getState().completed['task-a']).toBeTruthy();
});
