import { FocusTimer } from '@/features/focus-timer';
import { MicroBreaks } from '@/widgets/micro-breaks';
import { Card, Tabs } from '@/shared/ui';
import { useState } from 'react';
import { FaDiceD6, FaStopwatch } from 'react-icons/fa6';

interface FocusToolsProps {
  day: number;
}

const TABS = [
  { value: 'timer', label: 'Таймер 50/10', icon: <FaStopwatch /> },
  { value: 'breaks', label: 'Микро-паузы', icon: <FaDiceD6 /> },
];

export function FocusTools({ day }: FocusToolsProps) {
  const [tab, setTab] = useState('timer');

  return (
    <Card title="Фокус и паузы">
      <Tabs items={TABS} value={tab} onChange={setTab} ariaLabel="Инструменты" fullWidth />

      {tab === 'timer' ? <FocusTimer /> : <MicroBreaks day={day} />}
    </Card>
  );
}
