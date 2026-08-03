# Source Audit

Проверены полные файлы `index(10).html` и `index(11).html`; исходники сохранены неизменными в `sources/`. Нумерация отличается от master prompt (`index(6)/(7)`), поэтому идентификация сделана по фактическому содержимому, а не имени.

## Метод

- прочитан полный HTML, inline CSS и JavaScript;
- найдены embedded data blocks и localStorage keys;
- посчитаны записи, категории, equipment и targets;
- проверены внешние `http(s)` references;
- брендовые tokens сопоставлены между двумя источниками;
- данные извлечены программно, затем проверены на count, IDs и RU/EN;
- источники не модифицировались.

## index(10).html — MARKOV MADE GYM

Размер: 2 415 572 bytes.

### Обнаружено

- 1324 упражнения в `#mm-data`;
- 10 крупных зон тела;
- 28 типов оборудования;
- 50 мышечных целей;
- RU/EN названия и technique steps;
- поиск, фильтры и client-side state;
- КБЖУ/TDEE-интерфейс;
- workout construction и substitution logic;
- responsive mobile layout;
- local persistence;
- визуальная система obsidian/ivory/gold;
- Manrope/Unbounded в брендовой иерархии.

### Перенесено без изменения смысла

- полный массив 1324 записей в `game/data/exercises.json`;
- bilingual names/instructions;
- equipment/muscle grouping;
- search/filter concept;
- ручное подтверждение действий;
- безопасный язык замены упражнения;
- Mifflin–St Jeor как стартовая оценка, не prescription.

### Переработано

- DOM-specific модель превращена в data contract;
- случайные/визуальные IDs заменены стабильными runtime IDs;
- монолитное хранение разделено на data, services и UI;
- calorie output окружён safety copy и 14-day adjustment rule;
- gym library отделена от сюжетного вознаграждения;
- тяжёлое упражнение не считается автоматически «лучше».

### Не переносится напрямую

- inline event handlers;
- presentation-only DOM structure;
- неявные global variables;
- внешние assets без подтверждённой лицензии;
- формулировки, которые могут восприниматься индивидуальным назначением.

## index(11).html — MARKOVMADE

Размер: 951 629 bytes.

### Обнаружено

- позиционирование тела, питания, дисциплины и наставничества;
- авторская история и tone of voice;
- premium editorial композиция;
- глубокий чёрный, ivory, platinum и restrained gold;
- крупная condensed typography;
- calculators и lead forms;
- RU/EN copy layers;
- responsive sections;
- анимации и scroll-driven transitions;
- local form state;
- внешние изображения.

### Зафиксированные tokens

| Token | Source value | Runtime role |
|---|---|---|
| Obsidian | `#050505` | main background |
| Carbon | `#0F0F0F` | panel/background 2 |
| Ivory | `#F2F2F2` | primary text |
| Gold | `#D4AF37` | action/accent |
| Muted platinum | derived gray range | secondary copy |

### Перенесено

- публичное имя, слоганы и авторство;
- спокойный язык без hype;
- editorial scale and whitespace;
- gold only for meaningful action/state;
- системное позиционирование;
- связь тела, решений и контекста;
- SOFT theme concept;
- landing composition и product authorship.

### Переработано

- маркетинговый скролл превращён в landing + playable vertical;
- декоративные цифры привязаны к реальным системным состояниям;
- формы lead generation исключены из игры;
- анимации получают reduced-motion fallback;
- внешние изображения заменены двумя оригинальными локальными key art;
- публичный copy отделён от safety/product copy.

## Assets и внешние ссылки

В `index(11).html` найдено 21 изображение на `i.ibb.co`. Они не включены в runtime и не hotlinkятся:

- неизвестна chain of title;
- внешний хост может изменить/удалить content;
- store review требует подтверждаемой лицензии;
- изображения могут содержать likeness.

Новый пакет использует:

- `recode-meridian-hero.png` — оригинальный cinematic key art;
- `recode-character-ensemble.png` — оригинальный ансамбль восьми взрослых персонажей;
- локальные SVG placeholders для scalable production;
- procedural audio placeholders.

## Accessibility observations

Источники дают responsive foundation и контрастную систему, но коммерческий runtime дополнительно требует:

- semantic focus order;
- controller navigation;
- screen-reader names;
- 200% text;
- reduced motion;
- no color-only state;
- safe-area and Dynamic Type;
- text alternatives for audio.

Эти требования описаны в `ACCESSIBILITY.md` и `TEST_PLAN.md`.

## Privacy observations

Client-side storage найдено в источниках. В игре local state разделён по purpose. Journal и raw health data не должны попадать в analytics. Формы и внешняя отправка не включаются без отдельного consent и backend purpose.

## Лицензионные риски

1. Референсные игры используются только на уровне абстрактных механик.
2. Их персонажи, сюжеты, интерфейсы, тексты, логотипы и audio не копируются.
3. Web fonts должны быть получены из официального источника и поставляться по допустимой лицензии.
4. Фото/голос/likeness Павла не используются без отдельного permission.
5. External source images не включены.
6. Store screenshots создаются только из фактической сборки.
7. Legal drafts требуют counsel review.

## Итог extraction

`game/data/exercises.json` содержит `count: 1324`, 1324 уникальных ID и непустые RU/EN поля. Валидатор сравнивает declared count с длиной массива и отклоняет дубликаты. Это полное программное извлечение, а не вручную переписанный sample.
