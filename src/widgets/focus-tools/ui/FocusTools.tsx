import { FocusTimer } from '@/features/focus-timer';
import { DiceRoller } from '@/features/roll-dice';
import { Card, Tabs } from '@/shared/ui';
import { useState } from 'react';
import { FaDiceD6, FaStopwatch } from 'react-icons/fa6';

interface FocusToolsProps {
  day: number;
}

const TABS = [
  { value: 'timer', label: 'Таймер 50/10', icon: <FaStopwatch /> },
  { value: 'dice', label: 'Кубик', icon: <FaDiceD6 /> },
];

export function FocusTools({ day }: FocusToolsProps) {
  const [tab, setTab] = useState('timer');

  return (
    <Card title="Фокус и паузы">
      <Tabs items={TABS} value={tab} onChange={setTab} ariaLabel="Инструменты" fullWidth />
      {tab === 'timer' ? <FocusTimer /> : <DiceRoller day={day} />}
    </Card>
  );
}
