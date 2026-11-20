import { vi } from 'vitest';

/** Простое localStorage в памяти для тестов (в Node его нет). */
const data = new Map<string, string>();

vi.stubGlobal('localStorage', {
  getItem: (key: string) => data.get(key) ?? null,
  setItem: (key: string, value: string) => void data.set(key, String(value)),
  removeItem: (key: string) => void data.delete(key),
  clear: () => data.clear(),
  key: (index: number) => [...data.keys()][index] ?? null,
  get length() {
    return data.size;
  },
} satisfies Storage);

/** jsdom не умеет <dialog>.showModal(): подменяем минимальной версией для тестов компонентов. */
if (typeof HTMLDialogElement !== 'undefined') {
  HTMLDialogElement.prototype.showModal = function showModal() {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close() {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
}
