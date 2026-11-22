import { supabase } from '@/shared/config/supabase';
import { PAGES } from '@/shared/config';
import { useState, type FormEvent } from 'react';
import { Button, Input, Modal } from '@/shared/ui';

async function checked(request: Promise<{ error: { message: string } | null }>) {
  const { error } = await request;
  if (error) throw new Error(error.message);
}

export function EmailAuthForm({
  initialMode,
  onClose,
}: {
  initialMode: 'login' | 'register';
  onClose: () => void;
}) {
  const [register, setRegister] = useState(initialMode === 'register');
  const [verify, setVerify] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resent, setResent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const auth = supabase?.auth;
  const options = { emailRedirectTo: new URL(PAGES.PROFILE, window.location.origin).href };

  async function run(action: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setError('');
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Запрос не выполнен. Попробуй ещё раз.');
    } finally {
      setBusy(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (verify) return;
    void run(async () => {
      if (!auth) throw new Error('Вход пока не настроен.');
      const address = email.trim();
      if (register) {
        const { data, error } = await auth.signUp({ email: address, password, options });
        if (error) throw error;
        if (!data.session) {
          setVerify(true);
          setPassword('');
        }
      } else {
        const { error } = await auth.signInWithPassword({ email: address, password });
        if (error?.code === 'email_not_confirmed') {
          setVerify(true);
          setPassword('');
        } else if (error) throw error;
      }
    });
  }

  return (
    <Modal
      open
      onClose={onClose}
      title={verify ? 'Подтверждение почты' : register ? 'Регистрация' : 'Вход'}
    >
      <form onSubmit={submit} className="flex min-w-0 flex-col gap-3">
        {verify ? (
          <>
            <p className="wrap-anywhere text-sm text-gray-400">
              Открой письмо на {email.trim()} и перейди по ссылке для подтверждения аккаунта.
            </p>
            {resent && <p role="status">Письмо отправлено повторно.</p>}
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  if (!auth) return;
                  setResent(false);
                  await checked(auth.resend({ type: 'signup', email: email.trim(), options }));
                  setResent(true);
                })
              }
            >
              Отправить письмо ещё раз
            </Button>
          </>
        ) : (
          <>
            <Input
              required
              label="Электронная почта"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <Input
              required
              label="Пароль"
              type="password"
              autoComplete={register ? 'new-password' : 'current-password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </>
        )}
        {error && (
          <p role="alert" className="wrap-anywhere text-sm text-red-400">
            {error}
          </p>
        )}
        {!verify && <Button type="submit" variant="primary" disabled={busy}>
          {register ? 'Зарегистрироваться' : 'Войти'}
        </Button>}
        <Button
          type="button"
          variant="ghost"
          disabled={busy}
          onClick={() => {
            setRegister(verify ? false : !register);
            setVerify(false);
            setResent(false);
            setPassword('');
            setError('');
          }}
        >
          {verify ? 'Перейти ко входу' : register ? 'Уже есть аккаунт' : 'Создать аккаунт'}
        </Button>
      </form>
    </Modal>
  );
}
