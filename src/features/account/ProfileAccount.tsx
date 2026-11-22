import { useAccount } from './useAccount';
import { useState, type ReactNode } from 'react';
import { EmailAuthForm } from './EmailAuthForm';
import { supabase } from '@/shared/config/supabase';
import { Button, Card, toast } from '@/shared/ui';

function GuestActions() {
  const [mode, setMode] = useState<'login' | 'register' | null>(null);
  return (
    <>
      <div className="grid grid-cols-2 gap-2">
        <Button variant="primary" onClick={() => setMode('login')}>
          Вход
        </Button>
        <Button onClick={() => setMode('register')}>Регистрация</Button>
      </div>
      {mode && <EmailAuthForm initialMode={mode} onClose={() => setMode(null)} />}
    </>
  );
}

function AccountControls({ children }: { children: ReactNode }) {
  const user = useAccount();
  if (user === undefined) return <p role="status">Загрузка аккаунта…</p>;
  if (!user) return <GuestActions />;
  return (
    <>
      {children}
      <Card title="Аккаунт">
        <p className="text-sm text-gray-400">План и прогресс хранятся в этом браузере.</p>
        <p className="wrap-anywhere">
          {user.email}
        </p>
        <Button variant="ghost" onClick={async () => {
          const result = await supabase?.auth.signOut({ scope: 'local' });
          if (result?.error) toast.error(result.error.message);
        }}>Выйти</Button>
      </Card>
    </>
  );
}

export function ProfileAccount({ children }: { children: ReactNode }) {
  return supabase ? (
    <AccountControls>{children}</AccountControls>
  ) : (
    <>
      {children}
      <Card title="Аккаунт">Гостевой режим</Card>
    </>
  );
}
