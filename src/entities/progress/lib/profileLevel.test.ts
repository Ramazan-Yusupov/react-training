import { expect, it } from 'vitest';
import { getProfileLevel } from './profileLevel';

it.each([
  [0, 1, 'Новичок', 100],
  [199, 2, 'Новичок', 1],
  [200, 3, 'Новичок', 100],
  [900, 10, 'Опытный', 100],
  [99900, 1000, 'Легенда', 0],
  [1000000, 1000, 'Легенда', 0],
])('определяет уровень и звание при %i XP', (xp, number, title, xpToNext) => {
  expect(getProfileLevel(Number(xp))).toMatchObject({ number, rank: { title }, xpToNext });
});
