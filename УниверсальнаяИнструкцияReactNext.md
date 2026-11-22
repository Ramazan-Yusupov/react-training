# Универсальная инструкция для React / Next.js проектов

> Назначение: общие правила для разработки разных проектов на React + TypeScript, Next.js + TypeScript и Tailwind CSS.
> Использование: можно положить в корень нового проекта как `AGENTS.md`, `CLAUDE.md`, `PROJECT_RULES.md` или использовать как базовую инструкцию для AI-агента.
> Важно: эта инструкция не содержит правил конкретного продукта. Всё, что относится к отдельному проекту, храни в отдельном файле `PROJECT_RULES.md`.

## Дополнительные skills для AI-агентов

Для усиления рабочих процессов AI-агентов можно использовать каталог Matt Pocock `mattpocock/skills`:

- GitHub: https://github.com/mattpocock/skills
- Назначение: переиспользуемые skills для реальной инженерной работы, включая планирование, реализацию, тестирование, отладку и review.
- Команда установки из README проекта:

```bash
npx skills@latest add mattpocock/skills
```

Правила использования:

1. Skills являются дополнительной workflow-подсказкой, а не заменой правил проекта.
2. Локальные инструкции проекта, архитектура, тесты и требования пользователя всегда важнее внешнего skill.
3. Перед применением skill проверь, подходит ли он текущей задаче и кодовой базе.
4. Не добавляй зависимости, архитектурные слои или рефакторинг только потому, что это предлагает общий skill.
5. После изменений запускай обязательные проверки проекта и проверяй пользовательские сценарии.

---

# 1. Главный принцип

Разрабатывай production-ready приложение, а не набор разрозненных компонентов.

Всегда соблюдай порядок:

1. Изучи текущую структуру проекта, `package.json`, routing, UI primitives, stores, hooks, schemas и правила проекта.
2. Найди существующие actions, helpers, schemas и компоненты, которые можно переиспользовать.
3. Определи минимальное изменение для задачи.
4. Сохрани существующее поведение.
5. Добавь новую функцию полным циклом: модель, validation, UI, storage/import/export, edge cases, проверки.
6. Запусти проверки и честно сообщи результат.

Не добавляй зависимости, абстракции, global store или архитектурный слой без реальной необходимости.
Для UI по умолчанию используй `shadcn/ui`; не добавляй другой UI-kit поверх него без явной причины.

---

# 2. Выбор React или Next.js

Используй Next.js, когда нужны:

- маршруты;
- SEO;
- SSR / Server Components;
- server actions;
- route handlers / API routes;
- auth;
- доступ к базе данных;
- private environment variables;
- публикация контента.

Используй React + Vite, когда:

- приложение полностью клиентское;
- SEO не нужен;
- это локальный инструмент, dashboard, editor, admin panel или desktop-like UI;
- сервер уже существует отдельно.

Не выбирай Next.js только ради моды. Не добавляй Redux, Zustand, React Query, form library или другой UI-kit без конкретной причины.

---

# 3. Базовый стек и проверки

По умолчанию:

- React;
- TypeScript strict mode;
- Tailwind CSS;
- `shadcn/ui` как обязательный UI-подход для чистого дизайна и быстрого создания интерфейса;
- Lucide React или icon library, которую использует текущая shadcn-конфигурация;
- ESLint;
- единый helper `cn()`;
- runtime validation для внешних данных;
- доступные HTML-элементы.

`shadcn/ui` используй как основной источник UI primitives: button, input, select, dialog, sheet, dropdown, tooltip, tabs, carousel, card, badge, skeleton, scroll-area и другие нужные компоненты. Собственные primitives создавай только если в shadcn нет подходящего компонента или проект уже имеет стабильный локальный primitive.

Для MVP сначала работай на mock/json/localStorage данных и проверяй локальные пользовательские сценарии. Backend, база данных, платежи, auth и внешние интеграции добавляй последними, когда UI, модели и flow уже понятны.

Минимальные команды после code changes:

```bash
npm run typecheck
npm run lint
npm run build
```

Не утверждай, что проект работает, если эти команды не запускались или завершились ошибкой.

---

# 4. Архитектура

Для Next.js проектов, которые будут расти, по умолчанию держи исходный код внутри `src/`: `src/app`, `src/components`, `src/lib`, `src/data`, `src/hooks`, `src/features`. Корневые служебные папки и файлы (`public`, configs, lock-файлы, README) оставляй в корне проекта.

Для маленьких проектов допустимо:

```text
src/
  app/ or pages/
  components/
  features/
  lib/
  shared/
```

Для средних и крупных проектов используй FSD-like подход:

```text
src/
  app/       # bootstrap, providers, layouts, routes
  views/     # page-level composition
  widgets/   # крупные UI-блоки
  features/  # пользовательские сценарии
  entities/  # доменная модель
  shared/    # generic helpers, config, thin wrappers over shadcn/ui
```

Направление импортов:

```text
app/views -> widgets -> features -> entities -> shared
```

Запрещено:

- импортировать `widgets` внутрь `features`;
- класть бизнес-логику в `shared`;
- делать `shared/lib` складом случайных функций;
- копировать mutation logic в нескольких UI-компонентах;
- делать deep imports в чужие внутренние файлы, если у модуля есть public API.

---

# 5. Public API

Каждая feature/entity/shared UI папка должна иметь понятный public API через `index.ts`, если модуль используется снаружи. Для shadcn primitives public API обычно уже находится в `components/ui/*` или локальном UI-слое проекта.

Хорошо:

```ts
import { createTask } from "@/features/create-task";
```

Плохо:

```ts
import { createTask } from "@/features/create-task/model/createTask";
```

Исключение: внутренний код самой feature/entity.

---

# 6. TypeScript

Обязательно:

- `strict: true`;
- не использовать `any`, кроме изолированного interop-кода;
- не скрывать ошибки типов через `as`;
- использовать discriminated unions для сложных состояний;
- валидировать runtime JSON через schema;
- не создавать несколько одинаковых типов без смысла.

Пример состояния:

```ts
type LoadState<T> =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; data: T }
  | { status: "error"; message: string };
```

---

# 7. React state и effects

Храни состояние там, где оно реально живёт:

| Тип состояния | Где хранить                                               |
| ------------- | --------------------------------------------------------- |
| Локальный UI  | `useState`, `useReducer`                                  |
| URL state     | route/search params                                       |
| Server state  | server rendering или cache/query layer                    |
| Form state    | form hook/library                                         |
| Global UI     | небольшой store при необходимости                         |
| Domain state  | entity/store, если состояние разделяется между сценариями |

Не клади в global store:

- hover;
- состояние одного dropdown;
- draft одного input;
- состояние одной modal;
- временный selected tab одного компонента.

`useEffect` нужен для синхронизации с внешним миром:

- browser API;
- timers;
- subscriptions;
- external stores;
- DOM integration.

Не используй `useEffect` для производных значений.

Плохо:

```tsx
const [fullName, setFullName] = useState("");

useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);
```

Хорошо:

```tsx
const fullName = `${firstName} ${lastName}`;
```

---

# 8. Next.js boundaries

В App Router компоненты серверные по умолчанию.

Ставь `"use client"` только там, где нужны:

- event handlers;
- local state;
- effects;
- `window`, `document`, `localStorage`;
- drag-and-drop;
- contenteditable;
- client-only libraries.

Не делай весь layout client component без необходимости.

Server-only код:

- DB access;
- auth;
- private API clients;
- secret env;
- webhooks;
- access checks.

Никогда не импортируй server-only модуль в client component.

---

# 9. Runtime validation и миграции

Все внешние данные валидируй на границе:

- request body;
- form data;
- URL/search params;
- upload files;
- import JSON;
- localStorage/IndexedDB data;
- ответ внешнего API.

Если добавляешь новое поле модели, обнови полный цикл:

1. TypeScript type.
2. Runtime schema.
3. Factory/default values.
4. Parser/migration для старых данных.
5. Normalize helpers.
6. Import/export.
7. Search/filter indexing, если поле нужно искать.
8. Undo/redo snapshot, если поле редактируется пользователем.
9. UI создания, редактирования и очистки.
10. Edge cases и проверки.

Пример:

```ts
return {
  ...item,
  status: item.status ?? "active",
  tags: normalizeTags(item.tags),
  dueDate: normalizeDate(item.dueDate),
};
```

Не добавляй поле модели только в UI.

---

# 10. Forms

Каждая форма должна иметь:

- validation schema;
- field errors;
- submit loading state;
- disabled submit во время отправки;
- защиту от повторного submit;
- error state;
- success behavior;
- reset/draft behavior, если применимо.

Форма не готова, если работает только при идеальном успешном ответе.

---

# 11. shadcn/ui и Shared UI

`shadcn/ui` обязателен по умолчанию для чистого, согласованного и быстрого UI.

Правила:

- сначала проверь, есть ли нужный component в shadcn registry;
- добавляй shadcn components через CLI или по локальному принятому способу проекта;
- не создавай свой Button/Input/Modal/Dropdown/Tooltip/Tabs/Card, если shadcn уже покрывает сценарий;
- адаптируй shadcn components через `className`, variants и композицию, а не через копирование похожих компонентов;
- бизнес-компоненты держи отдельно от primitives: `components/marketplace`, `features/*/ui`, `widgets/*`, `entities/*/ui`;
- в `components/ui` или `shared/ui` держи только shadcn primitives и тонкие универсальные wrappers;
- не клади туда бизнес-компоненты конкретного продукта;
- если компонент отсутствует в shadcn, создай минимальный локальный wrapper в стиле текущей shadcn-конфигурации.

Базовый набор shadcn для рабочих интерфейсов:

```text
button
input
select
textarea
checkbox
switch
dialog
sheet
dropdown-menu
popover
tooltip
tabs
card
badge
avatar
separator
scroll-area
skeleton
carousel
accordion
collapsible
hover-card
```

Для marketplace/chat/support сценариев также запланируй новые shadcn components:

```text
message
message-scroller
attachment
marker
```

Всегда используй `cn()`:

```ts
export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}
```

---

# 12. Выбор поверхности UI

Перед добавлением нового инструмента выбери правильное место:

| Размер функции                     | Куда помещать                     | Пример                                |
| ---------------------------------- | --------------------------------- | ------------------------------------- |
| 1-5 быстрых параметров             | context menu / dropdown / popover | статус, срок, теги                    |
| 5-12 параметров с группами         | popover с секциями и scroll       | свойства сущности, compact filters    |
| много данных или bulk actions      | sidebar / drawer                  | фильтры, tools panel                  |
| сложная форма или опасное действие | modal                             | import/export, подтверждение удаления |
| постоянная рабочая область         | отдельный view/page/widget        | dashboard, calendar, editor           |

Правило:

> Если control нужен иногда, держи его в меню.
> Если control нужен постоянно, оставляй его на поверхности.
> Если control сложный и длинный, выноси в sidebar или modal.

Не превращай маленький набор controls в большую карточку на странице. В рабочих интерфейсах это съедает пространство.

---

# 13. Compact UI для editor/dashboard/workspace

Для рабочих приложений главный контент должен оставаться главным.

Обязательно:

- title/body/board/editor не должны сдвигаться вниз из-за вторичных controls;
- свойства сущности лучше открывать через icon button рядом с заголовком;
- кнопка настроек должна иметь `aria-label`;
- важный status можно показать маленьким badge;
- create/add action должен находиться в понятном контексте;
- sidebar-heavy сценарии должны иметь mobile-friendly menu/switcher;
- не делай UI похожим на лендинг, если это рабочий инструмент.

Плохо:

```tsx
<LargePropertiesCard>
  <Select>Status</Select>
  <Select>Task</Select>
  <Input>Date</Input>
  <Input>Tags</Input>
</LargePropertiesCard>
```

Хорошо:

```tsx
<TitleRow>
  <TitleInput />
  <PropertiesMenu />
</TitleRow>
```

---

# 14. Overlay, dropdown, popover, context menu

Любое меню должно быть настоящим overlay.

Правила:

- если меню может выйти за контейнер, рендери его через `createPortal(..., document.body)`;
- используй `position: fixed` или надёжный positioning helper;
- ставь явный `z-index`;
- добавляй непрозрачный `backgroundColor`;
- не полагайся только на прозрачный `bg-black/50` или blur;
- добавляй border/ring/shadow;
- задавай `max-height` и `overflow-y-auto`;
- закрывай по `Escape`;
- закрывай по click/tap outside;
- не допускай, чтобы текст страницы просвечивал или рисовался поверх меню;
- hover/active state не должен менять размер пункта.

Минимальный overlay style:

```tsx
<div
  role="menu"
  className="rounded-2xl border p-2 shadow-2xl"
  style={{
    backgroundColor: "#151a21",
    boxShadow: "0 24px 70px rgb(0 0 0 / 78%)",
    isolation: "isolate",
    zIndex: 1000,
  }}
>
  ...
</div>
```

Если фон меню не прорисовывается или контент виден поверх него, проверь:

- portal;
- `position`;
- `z-index`;
- stacking context родителей;
- `isolation`;
- opacity/background;
- overflow/clip у родителей.

---

# 15. Списки options в меню

Список задач, проектов, пользователей, тегов или любых options в меню не должен быть плотной стеной текста.

Для item с двумя строками:

- `min-height` 40-44px;
- `gap` между иконкой, текстом и checkmark;
- vertical padding `py-1.5` или похожий;
- title и meta имеют разные line-height;
- между title и meta добавляй `mt-0.5`;
- parent с текстом должен иметь `min-w-0`;
- title/meta используют `truncate`;
- checkmark и иконки используют `shrink-0`.

Пример:

```tsx
<button className="flex min-h-11 items-center gap-2.5 rounded-lg px-2.5 py-1.5">
  <span className="min-w-0 flex-1">
    <span className="block truncate font-medium leading-5">{title}</span>
    <span className="mt-0.5 block truncate text-xs leading-4 text-muted">
      {meta}
    </span>
  </span>
  {isActive ? <Check className="shrink-0" /> : null}
</button>
```

---

# 16. Длинный текст и overflow

Любой пользовательский текст может быть длинным словом без пробелов.

Для editor/contenteditable/markdown/card title/comment:

- используй `min-w-0` на flex/grid child;
- используй актуальные Tailwind utilities для переноса длинных слов;
- в новых версиях Tailwind `break-words` может быть записан как `wrap-break-word`;
- проверяй документацию текущей версии Tailwind перед использованием классов переноса, overflow, text-wrap, grid, spacing и arbitrary values;
- если элемент внутри `flex` и длинный текст ломает ширину, проверь `wrap-anywhere`;
- для коротких строк в карточках используй `truncate`;
- для body-текста используй перенос, а не горизонтальное переполнение;
- текст не должен вылезать поверх menu/popover/modal;
- проверяй длинную строку без пробелов.

Для editable block:

```tsx
className = "min-w-0 wrap-break-word whitespace-pre-wrap";
```

Если проект использует старую версию Tailwind, где `wrap-break-word` недоступен, проверь локальную версию Tailwind и официальный docs/version notes, затем используй поддерживаемый equivalent: `break-words`, arbitrary value или CSS property.

Для badge:

```tsx
className = "inline-flex whitespace-nowrap";
```

Badge не должен сжимать текст вертикально. Если он не помещается, перенеси его на новую строку или используй `truncate` с понятной шириной.

---

# 17. Tailwind CSS: проверка актуальных классов

AI-агент обязан проверять текущую версию Tailwind в проекте перед использованием новых или спорных классов.

Порядок:

1. Посмотреть `package.json` и lockfile.
2. Определить major version Tailwind.
3. Проверить официальную документацию именно для этой версии, если класс может отличаться.
4. Не заменять классы механически без проверки.
5. Если используется arbitrary value, убедиться, что он реально попадает в build.

Особенно проверяй:

- `break-words` / `wrap-break-word` / `wrap-anywhere`;
- `text-wrap`, `text-balance`, `text-pretty`;
- `overflow-*`;
- `size-*`;
- arbitrary colors вроде `bg-[#151a21]`;
- arbitrary shadows;
- grid arbitrary templates;
- dynamic class names.

Не создавай dynamic Tailwind class так:

```tsx
const color = "red";
return <div className={`bg-${color}-500`} />;
```

Tailwind может не увидеть такой класс на build. Используй map:

```tsx
const colorClassName = {
  danger: "bg-red-500",
  success: "bg-emerald-500",
}[variant];
```

Если важный фон overlay не должен зависеть от Tailwind build, допустимо использовать inline `style.backgroundColor`.

---

# 18. Layout и sidebar collapse

Sidebar/drawer collapse не должен менять высоту страницы или оставлять пустой блок.

Правила:

- app shell: `h-dvh min-h-dvh overflow-hidden`;
- внутренние области: `flex min-h-0 flex-1 overflow-hidden`;
- scroll только на нужной области: `overflow-y-auto`;
- при collapse меняй width/flex-basis, а не высоту;
- collapsed sidebar имеет стабильную ширину;
- кнопка восстановления sidebar понятная;
- опасные/создающие actions не должны оставаться одинокой кнопкой без контекста;
- preference можно сохранять в localStorage.

Пример:

```tsx
<main className="flex h-dvh min-h-dvh flex-col overflow-hidden">
  <div className="flex min-h-0 flex-1 overflow-hidden">
    <Sidebar className="h-full min-h-0 shrink-0" />
    <section className="min-h-0 flex-1 overflow-y-auto" />
  </div>
</main>
```

---

# 19. Browser API и localStorage

В Next.js browser API доступны только в Client Components.

Правила:

- файл с `localStorage`, `window`, `document`, drag/drop, contenteditable должен иметь `"use client"`;
- не читай `localStorage` в server component;
- не ломай hydration разными initial values;
- storage операции оборачивай в `try/catch`;
- storage failure не должен ломать UI;
- persisted UI preference проверяй после reload;
- build не должен падать из-за `window is not defined`.

Пример:

```tsx
const toggle = useCallback(() => {
  setIsCollapsed((current) => {
    const next = !current;

    try {
      window.localStorage.setItem(KEY, next ? "true" : "false");
    } catch {
      // UI still works without browser storage.
    }

    return next;
  });
}, []);
```

Проверь:

- default state при пустом storage;
- reload сохраняет состояние;
- private mode/storage error не ломает экран;
- build не падает из-за `window is not defined`.

---

# 20. Связи между инструментами

Если сущность связывается с другой сущностью, связь должна быть настоящей:

- хранится в модели;
- видна в UI;
- клик открывает связанную сущность;
- при создании связанной сущности связь записывается сразу;
- import/export сохраняет связь;
- search/filter учитывает связь, если это полезно;
- при удалении связанной сущности UI показывает fallback.

Не создавай декоративную кнопку "Связать", если связь не сохраняется.

---

# 21. Единые domain operations

Одна пользовательская операция должна иметь один источник правды.

Нельзя:

- в slash menu создавать сущность одним способом;
- в toolbar другим;
- в command palette обходить validation;
- в context menu дублировать mutation logic.

Правильно:

- domain operation живёт в одном месте;
- UI-компоненты вызывают эту операцию;
- validation и ограничения единые для всех entry points.

---

# 23. Accessibility

Обязательно:

- `<button>` для действий;
- `<a>` для навигации;
- `aria-label` для icon-only buttons;
- label для input;
- видимый focus;
- keyboard navigation;
- Escape для modal/popover;
- click outside для popover;
- focus trap для modal;
- не использовать цвет как единственный источник смысла;
- не заменять `<button>` на `<div onClick>`.

---

# 24. Loading, empty и error states

Для экранов с данными предусмотрены:

- loading;
- success;
- empty;
- permission denied;
- network error;
- server error;
- retry.

Пустой экран без объяснения - баг.

---

# 25. Security

Обязательно:

- секреты только на сервере;
- runtime validation;
- access control на сервере;
- MIME/size validation для файлов;
- sanitizer для пользовательского HTML;
- не использовать `dangerouslySetInnerHTML` без sanitizer;
- не логировать токены и персональные данные;
- не доверять role/userId из браузера.

---

# 26. Performance

Сначала измерь, потом оптимизируй.

Используй:

- dynamic import для тяжёлых editor/chart/map/pdf модулей;
- image optimization;
- virtualization для больших списков;
- abort/stale request protection для поиска;
- selectors для уменьшения rerenders.

Не добавляй memoization без причины.

---

# 27. Проверка дизайна на реальном контенте

Для повышения качества интерфейсов можно использовать как дополнительный ориентир:

- https://jakub.kr/skills/make-interfaces-feel-better

Эта ссылка полезна при полировке typography, hover states, shadows, borders, spacing, optical alignment, micro-interactions и общего ощущения интерфейса.

Перед завершением UI-задачи вставь:

- длинное слово без пробелов;
- длинный русский заголовок;
- короткий title;
- пустой title;
- несколько tags;
- длинное название списка/категории;
- несколько options в dropdown;
- active/inactive status;
- date и отсутствие date.

Проверь:

- нет overlap;
- overlay перекрывает контент;
- текст не просвечивает через меню;
- badge не сжимает текст вертикально;
- элементы не прилипают друг к другу;
- scrollbar не перекрывает важный текст;
- hover/focus state читаем;
- desktop и mobile ширины выглядят нормально.

---

# 28. Проверки после изменений

После code changes:

```bash
npm run typecheck
npm run lint
npm run build
```

Если затронут UI:

- открыть страницу в браузере;
- пройти основной сценарий;
- проверить keyboard и mouse;
- проверить Escape/click outside;
- проверить reload;
- проверить long text;
- проверить mobile width;
- сделать screenshot, если менялся визуальный слой.

Если браузерная проверка невозможна, честно напиши это. Не выдавай `typecheck` за визуальную проверку.

---

# 29. Git и рабочее дерево

Перед изменениями проверь состояние:

```bash
git status --short
```

Правила:

- не откатывай чужие изменения без явного запроса;
- не используй destructive команды без явного разрешения;
- не делай unrelated refactor;
- не коммить автоматически, если пользователь не просил;
- не меняй line endings и форматирование всего проекта без необходимости.

---

# 30. Финальный отчёт

В финальном ответе укажи:

- что изменено;
- какие файлы важны;
- какие проверки запущены;
- что не удалось проверить;
- какие риски остались.

Пиши кратко и честно.
