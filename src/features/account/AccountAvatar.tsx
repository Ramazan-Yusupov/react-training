import { Avatar } from '@/shared/ui';
import { useAccount } from './useAccount';

export function AccountAvatar({ size }: { size: 'sm' | 'xl' }) {
  const user = useAccount();
  return <Avatar size={size} name={user?.email || 'Планер'} alt="Аватар профиля" />;
}
