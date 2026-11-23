import { useEffect, useRef, useState, type ReactNode } from 'react';
import { supabase } from '@/shared/config/supabase';
import { Button } from '@/shared/ui';
import { createInitialPlan, usePlanStore } from '@/entities/plan';
import { createInitialProgress, useProgressStore } from '@/entities/progress';
import { DEFAULT_SETTINGS, useSettingsStore } from '@/entities/settings';
import { createInitialMicroBreaks, useMicroBreakStore } from '@/entities/micro-breaks';
import { snapshot, restore, validateBackup } from '@/features/backup';
import { useAccount } from './useAccount';
import { AccountSavingContext } from './AccountSavingContext';

const stores = [usePlanStore, useProgressStore, useSettingsStore, useMicroBreakStore] as const;
type Snapshot = ReturnType<typeof snapshot>;
type Write = { base: string | null; revision: string; payload: Snapshot };
const memoryOnly = { getItem: () => null, setItem: () => {}, removeItem: () => {} };

function SignedInWorkspace({ id, children }: { id: string; children: ReactNode }) {
  const [state, setState] = useState<'loading' | 'choose' | 'ready' | 'error' | 'conflict'>(
    'loading',
  );
  const [message, setMessage] = useState('');
  const [retry, setRetry] = useState(0);
  const choose = useRef<(local: boolean) => void>(() => {});
  const key = 'planer-pending-v1:' + id;

  useEffect(() => {
    const client = supabase!;
    const guest = snapshot();
    let active = true;
    let writing = false;
    let revision: string | null = null;
    let queue: Write[] = [];
    const unsub: (() => void)[] = [];
    // Account data must never be persisted under the anonymous workspace keys.
    const resume = stores.map((store) => {
      const storage = store.persist.getOptions().storage;
      store.persist.setOptions({ storage: memoryOnly });
      return () => store.persist.setOptions({ storage });
    });
    setState('loading');
    const table = () => client.from('account_plans');
    function persistQueue() {
      if (queue.length) sessionStorage.setItem(key, JSON.stringify(queue));
      else sessionStorage.removeItem(key);
    }
    function fail(e: unknown) {
      if (!active) return;
      setMessage(
        e instanceof Error ? e.message : 'Проверь подключение и наличие таблицы account_plans.',
      );
      setState('error');
    }
    async function flush() {
      if (writing) return;
      writing = true;
      try {
        while (active && queue.length) {
          const first = queue[0]!;
          const row = { revision: first.revision, payload: first.payload };
          const result = first.base
            ? await table()
                .update(row)
                .eq('user_id', id)
                .eq('revision', first.base)
                .select('revision')
                .maybeSingle()
            : await table()
                .insert({ ...row, user_id: id })
                .select('revision')
                .single();
          if (!active) return;
          if (result.error?.code === '23505' || (!result.error && !result.data)) {
            setState('conflict');
            return;
          }
          if (result.error) throw new Error(result.error.message);
          revision = first.revision;
          queue.shift();
          persistQueue();
        }
        if (active) setMessage('');
      } catch (e) {
        fail(e);
      } finally {
        writing = false;
      }
    }
    function enqueue() {
      const entry = {
        base: queue[0]?.revision ?? revision,
        revision: crypto.randomUUID(),
        payload: snapshot(),
      };
      if (queue.length > 1) queue[1] = entry;
      else queue.push(entry);
      try {
        persistQueue();
      } catch (e) {
        fail(e);
        return;
      }
      setMessage('Сохранение…');
      void flush();
    }
    function ready() {
      stores.forEach((store) => unsub.push(store.subscribe(enqueue)));
      setState('ready');
      setMessage('');
    }
    async function load() {
      const { data, error } = await table()
        .select('revision,payload')
        .eq('user_id', id)
        .maybeSingle();
      if (!active) return;
      if (error) throw new Error(error.message);
      revision = data?.revision ?? null;
      queue = JSON.parse(sessionStorage.getItem(key) ?? '[]');
      if (queue.length && queue[0]!.revision === revision) {
        queue.shift();
        persistQueue();
      }
      if (queue.length && queue[0]!.base !== revision) {
        setState('conflict');
        return;
      }
      const payload: unknown = queue.at(-1)?.payload ?? data?.payload;
      if (payload) {
        if (!validateBackup(payload) || payload.version !== 2 || !payload.microBreaks)
          throw new Error('Повреждена копия плана.');
        restore(payload);
        ready();
        void flush();
        return;
      }
      choose.current = (local) => {
        if (!active || writing) return;
        if (!local)
          restore({
            ...guest,
            plan: createInitialPlan(),
            progress: createInitialProgress(),
            settings: DEFAULT_SETTINGS,
            microBreaks: createInitialMicroBreaks(),
          });
        ready();
        enqueue();
      };
      setState('choose');
    }
    void load().catch(fail);
    return () => {
      active = false;
      unsub.forEach((stop) => stop());
      restore(guest);
      resume.forEach((fn) => fn());
    };
  }, [id, key, retry]);

  if (state === 'ready')
    return (
      <AccountSavingContext.Provider value={Boolean(message)}>
        {children}
      </AccountSavingContext.Provider>
    );
  return (
    <main className="mx-auto flex max-w-md flex-col gap-4 p-6">
      {state === 'loading' && <p role="status">Загрузка плана из аккаунта…</p>}
      {state === 'choose' && (
        <>
          <h1>Первый план в аккаунте</h1>
          <p>Выбери, какой план открывать на всех устройствах.</p>
          <Button onClick={() => choose.current(true)}>Перенести план этого браузера</Button>
          <Button onClick={() => choose.current(false)}>Начать со стартового плана</Button>
        </>
      )}
      {state === 'error' && (
        <>
          <p role="alert">Ошибка синхронизации: {message}</p>
          <Button onClick={() => setRetry((n) => n + 1)}>Повторить</Button>
        </>
      )}
      {state === 'conflict' && (
        <>
          <p role="alert">
            План изменён на другом устройстве. Загрузка облачной версии заменит несохранённые
            изменения этой вкладки.
          </p>
          <Button
            onClick={() => {
              sessionStorage.removeItem(key);
              setRetry((n) => n + 1);
            }}
          >
            Принять облачную версию
          </Button>
        </>
      )}
      {state !== 'loading' && (
        <Button variant="ghost" onClick={() => void supabase?.auth.signOut({ scope: 'local' })}>
          Выйти в гостевой режим
        </Button>
      )}
    </main>
  );
}

export function AccountWorkspace({ children }: { children: ReactNode }) {
  const user = useAccount();
  if (supabase && user === undefined) return <p role="status">Загрузка аккаунта…</p>;
  return user ? (
    <SignedInWorkspace key={user.id} id={user.id}>
      {children}
    </SignedInWorkspace>
  ) : (
    <>{children}</>
  );
}
