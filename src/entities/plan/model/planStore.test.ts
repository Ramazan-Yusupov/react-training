import { describe, expect, it } from 'vitest';

import { createInitialPlan, normalizePlanData } from './planStore';

describe('модель пользовательского плана', () => {
  it('создаёт начальный план на 30 дней', () => {
    const plan = createInitialPlan();

    expect(plan.template.days).toHaveLength(30);
    expect(plan.template.days[0]?.day).toBe(1);
    expect(plan.template.days[29]?.day).toBe(30);
  });

  it('создаёт стартовую карточку и задачу', () => {
    const plan = createInitialPlan();
    const firstDay = plan.template.days[0];

    expect(firstDay?.groups).toHaveLength(1);
    expect(firstDay?.groups[0]?.title).toBe('Утро');

    expect(firstDay?.tasks).toHaveLength(1);
    expect(firstDay?.tasks[0]?.title).toBe('Создать план');
    expect(firstDay?.tasks[0]?.durationMin).toBe(5);
    expect(firstDay?.tasks[0]?.xp).toBe(5);
  });

  it('расширяет старый план до 30 дней без потери существующих данных', () => {
    const oldPlan = {
      schemaVersion: 1,
      template: {
        id: 'user-plan',
        title: 'Мой план',
        description: 'Описание',
        days: [
          {
            day: 1,
            groups: [
              {
                id: 'custom-group',
                title: 'Работа',
              },
            ],
            tasks: [
              {
                id: 'custom-task',
                originId: 'custom-task',
                title: 'Моя задача',
                durationMin: 30,
                xp: 20,
                required: true,
                groupId: 'custom-group',
              },
            ],
            widgets: [],
          },
        ],
      },
      dayOverrides: {},
    };

    const migrated = normalizePlanData(oldPlan, true);

    expect(migrated.template.days).toHaveLength(30);

    expect(migrated.template.days[0]?.groups[0]?.title).toBe('Работа');

    expect(migrated.template.days[0]?.tasks[0]?.title).toBe('Моя задача');

    expect(migrated.template.days[0]?.tasks[0]?.xp).toBe(20);
    expect(migrated.template.days[29]?.day).toBe(30);
  });

  it('сохраняет переопределения отдельных дней', () => {
    const plan = createInitialPlan();

    const customizedDay = {
      ...plan.template.days[4]!,
      groups: [
        {
          id: 'custom-day-group',
          title: 'Особенный день',
        },
      ],
      tasks: [],
    };

    const migrated = normalizePlanData(
      {
        ...plan,
        dayOverrides: {
          '5': customizedDay,
        },
      },
      true,
    );

    expect(migrated.dayOverrides['5']?.groups[0]?.title).toBe('Особенный день');

    expect(migrated.template.days).toHaveLength(30);
  });

  it('не теряет валидные задачи из-за одной повреждённой записи', () => {
    const plan = createInitialPlan();

    const migrated = normalizePlanData({
      ...plan,
      template: {
        ...plan.template,
        days: [
          {
            day: 1,
            groups: [
              {
                id: 'group-1',
                title: 'Работа',
              },
            ],
            tasks: [
              {
                id: 'valid-task',
                originId: 'valid-task',
                title: 'Валидная задача',
                durationMin: 10,
                xp: 5,
                required: true,
                groupId: 'group-1',
              },
              {
                id: 'broken-task',
                title: '',
                durationMin: -1,
                xp: 5,
                required: true,
                groupId: 'group-1',
              },
            ],
            widgets: [],
          },
        ],
      },
    });

    expect(migrated.template.days[0]?.tasks).toHaveLength(1);

    expect(migrated.template.days[0]?.tasks[0]?.title).toBe('Валидная задача');
  });

  it('восстанавливает отсутствующие поля дня', () => {
    const migrated = normalizePlanData({
      schemaVersion: 1,
      template: {
        id: 'user-plan',
        title: 'Мой план',
        description: '',
        days: [
          {
            day: 1,
          },
        ],
      },
      dayOverrides: {},
    });

    expect(migrated.template.days[0]).toMatchObject({
      day: 1,
      groups: [],
      tasks: [],
      widgets: [],
      contentOrder: [],
    });
  });

  it('не расширяет импортируемый план до 30 дней автоматически', () => {
    const migrated = normalizePlanData({
      schemaVersion: 1,
      template: {
        id: 'user-plan',
        title: 'Короткий план',
        description: '',
        days: [
          {
            day: 1,
            groups: [],
            tasks: [],
            widgets: [],
          },
          {
            day: 2,
            groups: [],
            tasks: [],
            widgets: [],
          },
        ],
      },
      dayOverrides: {},
    });

    expect(migrated.template.days).toHaveLength(2);
  });

  it('переносит содержимое старого Accordion в заметки', () => {
    const migrated = normalizePlanData({
      schemaVersion: 1,
      template: {
        id: 'user-plan',
        title: 'Мой план',
        description: '',
        days: [
          {
            day: 1,
            groups: [],
            tasks: [],
            widgets: [
              {
                id: 'old-accordion',
                type: 'accordion',
                enabled: true,
                accordionItems: [
                  {
                    title: 'Раздел 1',
                    content: 'Содержимое раздела',
                  },
                ],
              },
            ],
          },
        ],
      },
      dayOverrides: {},
    });

    expect(migrated.template.days[0]?.widgets[0]).toMatchObject({
      id: 'old-accordion',
      type: 'day-notes',
      enabled: true,
      notes: 'Раздел 1\nСодержимое раздела',
    });
  });
});
