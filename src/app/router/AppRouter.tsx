import { PAGES } from '@/shared/config';
import { lazy } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';

const TodayPage = lazy(() => import('@/pages/today').then((m) => ({ default: m.TodayPage })));

const ProgressPage = lazy(() =>
  import('@/pages/progress').then((m) => ({ default: m.ProgressPage })),
);

const SettingsPage = lazy(() =>
  import('@/pages/settings').then((m) => ({ default: m.SettingsPage })),
);

const ProfilePage = lazy(() => import('@/pages/profile'));

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path={PAGES.TODAY} element={<TodayPage />} />
        <Route path={PAGES.PROGRESS} element={<ProgressPage />} />
        <Route path={PAGES.SETTINGS} element={<SettingsPage />} />
        <Route path={PAGES.PROFILE} element={<ProfilePage />} />

        <Route path="*" element={<Navigate to={PAGES.TODAY} replace />} />
      </Route>
    </Routes>
  );
}
