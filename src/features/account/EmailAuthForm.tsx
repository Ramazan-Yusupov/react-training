import { supabase } from '@/shared/config/supabase';
import { PAGES } from '@/shared/config';
import { useState, type FormEvent } from 'react';
import { Button, Input, Modal } from '@/shared/ui';

function authErrorMessage(error: unknown) {
  const code = error && typeof error === 'object' && 'code' in error ? error.code : undefined;
  const message = error instanceof Error ? error.message.toLowerCase() : '';
  switch (code) {
    case 'invalid_credentials':
      return 'Неверная почта или пароль.';
    case 'weak_password':
      return 'Пароль слишком простой. Выбери более надёжный пароль.';
    case 'email_address_invalid':
      return 'Проверь адрес электронной почты.';
    case 'user_already_exists':
      return 'Аккаунт с такой почтой уже существует.';
    case 'over_email_send_rate_limit':
      return 'Достигнут лимит отправки писем. Попробуй позже.';
    case 'over_request_rate_limit':
      return 'Слишком много попыток. Попробуй позже.';
  }
  if (message.includes('error sending confirmation email'))
    return 'Не удалось отправить письмо подтверждения. Попробуй позже.';
  if (message.includes('email rate limit exceeded'))
    return 'Достигнут лимит отправки писем. Попробуй позже.';
  return 'Не удалось выполнить запрос. Попробуй ещё раз.';
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
      setError(authErrorMessage(e));
    } finally {
      setBusy(false);
    }
  }

  function submit(event: FormEvent) {
    event.preventDefault();
    if (verify) return;
    void run(async () => {
      if (!auth) {
        setError('Вход пока не настроен.');
        return;
      }
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
            <p className="wrap-anywhere text-center text-sm text-gray-400">
              Открой письмо на {email.trim()} и перейди по ссылке для подтверждения аккаунта.
            </p>
            {resent && <p role="status" className="text-center">Письмо отправлено повторно.</p>}
            <Button
              type="button"
              variant="ghost"
              disabled={busy}
              onClick={() =>
                void run(async () => {
                  if (!auth) return;
                  setResent(false);
                  const { error } = await auth.resend({ type: 'signup', email: email.trim(), options });
                  if (error) throw error;
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
          <p role="alert" className="wrap-anywhere text-center text-sm text-red-400">
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
