import { PAGES } from '@/shared/config';
import { cn } from '@/shared/lib';
import { HeaderXpStatus } from '@/widgets/xp-summary';
import type { ReactNode } from 'react';
import { FaChartLine, FaGear, FaListCheck } from 'react-icons/fa6';
import { NavLink } from 'react-router-dom';

interface NavItem {
  to: string;
  label: string;
  icon: ReactNode;
}

const ITEMS: NavItem[] = [
  { to: PAGES.TODAY, label: 'Сегодня', icon: <FaListCheck /> },
  { to: PAGES.PROGRESS, label: 'Прогресс', icon: <FaChartLine /> },
  { to: PAGES.SETTINGS, label: 'Настройки', icon: <FaGear /> },
];

/** Общая шапка с навигацией, уровнем, XP и кубками. */
export function Navigation() {
  return (
    <>
      <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-neutral-950/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5">
          <nav aria-label="Основная навигация" className="flex min-w-0 items-center gap-2">
            <span className="mr-2 shrink-0 font-semibold text-white">Планер</span>

            <div className="hidden items-center gap-1 md:flex">
              {ITEMS.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === PAGES.TODAY}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors',
                      isActive ? 'bg-white/10 text-white' : 'text-gray-400 hover:text-white',
                    )
                  }
                >
                  {item.icon}
                  {item.label}
                </NavLink>
              ))}
            </div>
          </nav>

          <HeaderXpStatus />
        </div>
      </header>

      <nav
        aria-label="Основная навигация"
        className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-neutral-950/95 backdrop-blur md:hidden"
      >
        <ul className="grid grid-cols-3">
          {ITEMS.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.to === PAGES.TODAY}
                className={({ isActive }) =>
                  cn(
                    'flex flex-col items-center gap-1 py-2.5 text-[11px] transition-colors',
                    isActive ? 'text-blue-400' : 'text-gray-400',
                  )
                }
              >
                <span className="text-lg">{item.icon}</span>
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
