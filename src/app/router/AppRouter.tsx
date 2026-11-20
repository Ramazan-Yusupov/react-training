import { PAGES } from '@/shared/config';
import { lazy } from 'react';
import { Route, Routes } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';

const TodayPage = lazy(() => import('@/pages/today').then((m) => ({ default: m.TodayPage })));
const PlanPage = lazy(() => import('@/pages/plan').then((m) => ({ default: m.PlanPage })));
const ProgressPage = lazy(() =>
  import('@/pages/progress').then((m) => ({ default: m.ProgressPage })),
);
const PosturePage = lazy(() => import('@/pages/posture').then((m) => ({ default: m.PosturePage })));
const SettingsPage = lazy(() =>
  import('@/pages/settings').then((m) => ({ default: m.SettingsPage })),
);

export function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path={PAGES.TODAY} element={<TodayPage />} />
        <Route path={PAGES.PLAN} element={<PlanPage />} />
        <Route path={PAGES.PROGRESS} element={<ProgressPage />} />
        <Route path={PAGES.POSTURE} element={<PosturePage />} />
        <Route path={PAGES.SETTINGS} element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
