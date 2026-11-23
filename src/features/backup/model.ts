import { userPlanSchema, usePlanStore, type UserPlanData } from '@/entities/plan';
import { useMicroBreakStore, type MicroBreakData } from '@/entities/micro-breaks';
import { useProgressStore, type ProgressData } from '@/entities/progress';
import { DEFAULT_SETTINGS, useSettingsStore, type SettingsData } from '@/entities/settings';

type BackupData = ({ version: 1 } | { version: 2; plan: UserPlanData }) & {
  exportedAt: string;
  progress: ProgressData;
  settings: SettingsData;
  microBreaks?: MicroBreakData;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isValidDuration(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 1;
}

function isMicroBreakData(value: unknown): value is MicroBreakData {
  if (!isRecord(value) || !Array.isArray(value.items)) {
    return false;
  }

  const ids = new Set<string>();

  for (const item of value.items) {
    if (!isRecord(item)) {
      return false;
    }

    const validItem =
      typeof item.id === 'string' &&
      item.id.trim().length > 0 &&
      typeof item.text === 'string' &&
      item.text.trim().length > 0 &&
      typeof item.durationMinutes === 'number' &&
      Number.isInteger(item.durationMinutes) &&
      item.durationMinutes >= 1 &&
      item.durationMinutes <= 60 &&
      typeof item.enabled === 'boolean' &&
      typeof item.order === 'number' &&
      Number.isInteger(item.order) &&
      item.order >= 0;

    if (!validItem || ids.has(item.id as string)) {
      return false;
    }

    ids.add(item.id as string);
  }

  return true;
}

export function validateBackup(value: unknown): value is BackupData {
  if (!isRecord(value) || (value.version !== 1 && value.version !== 2)) {
    return false;
  }

  if (value.version === 2 && !userPlanSchema.safeParse(value.plan).success) {
    return false;
  }

  const { progress, settings, microBreaks } = value;

  if (!isRecord(progress) || !isRecord(settings)) {
    return false;
  }

  const validProgress =
    typeof progress.startDate === 'string' &&
    isRecord(progress.completed) &&
    isRecord(progress.microBreaks);

  const validSettings =
    isRecord(settings.rewards) &&
    (settings.workDurationMin === undefined || isValidDuration(settings.workDurationMin)) &&
    (settings.breakDurationMin === undefined || isValidDuration(settings.breakDurationMin)) &&
    (settings.workLabel === undefined ||
      (typeof settings.workLabel === 'string' && settings.workLabel.trim().length > 0));

  const validMicroBreaks = microBreaks === undefined || isMicroBreakData(microBreaks);

  return validProgress && validSettings && validMicroBreaks;
}

export function snapshot() {
  const { schemaVersion, template, dayOverrides } = usePlanStore.getState();
  const progressState = useProgressStore.getState();
  const settingsState = useSettingsStore.getState();
  const microBreakState = useMicroBreakStore.getState();

  return {
    version: 2 as const,
    plan: { schemaVersion, template, dayOverrides },
    exportedAt: new Date().toISOString(),
    progress: {
      startDate: progressState.startDate,
      completed: progressState.completed,
      microBreaks: progressState.microBreaks,
    },
    settings: {
      rewards: settingsState.rewards,
      workDurationMin: settingsState.workDurationMin,
      breakDurationMin: settingsState.breakDurationMin,
      workLabel: settingsState.workLabel,
    },
    microBreaks: {
      items: microBreakState.items,
    },
  };
}

export function restore(parsed: BackupData) {
  if (parsed.version === 2) {
    usePlanStore.getState().replaceAll(parsed.plan);
  }

  useProgressStore.getState().replaceAll({
    startDate: parsed.progress.startDate,
    completed: parsed.progress.completed,
    microBreaks: parsed.progress.microBreaks,
  });

  useSettingsStore.getState().replaceAll({
    rewards: parsed.settings.rewards as Record<string, string>,
    workDurationMin: parsed.settings.workDurationMin ?? DEFAULT_SETTINGS.workDurationMin,
    breakDurationMin: parsed.settings.breakDurationMin ?? DEFAULT_SETTINGS.breakDurationMin,
    workLabel: parsed.settings.workLabel ?? DEFAULT_SETTINGS.workLabel,
  });

  if (parsed.microBreaks) {
    useMicroBreakStore.getState().replaceAll(parsed.microBreaks);
  }
}
