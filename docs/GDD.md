# Game Design Document — MARKOVMADE: RECODE

Версия документа: 6.0 · Продуктовая версия: 7.0.0

**Original concept, system and authorship: Павел Марков / Pavel Markov / MARKOVMADE**

## 1. Product thesis

RECODE — сюжетная life RPG, в которой игрок развивает не заменителя себя, а собственную устойчивость. Цифровой герой является зеркалом: изменения открываются после реальных действий, решений и возвращений, а не после покупки энергии.

Формула:

`ситуация → взрослый выбор → реальное действие 3–20 минут → проверяемое последствие → новый контекст`

Продукт должен создавать четыре переживания:

1. «Меня видят без унижения».
2. «Малое действие считается».
3. «Срыв не обнуляет историю».
4. «Мои решения формируют мир и отношения».

## 2. Audience

Primary: взрослые 24–44, которые знают основы саморазвития, но сталкиваются с циклом «рывок — перегруз — срыв — стыд». Они не хотят детской геймификации, фальшивой мотивации и медицинских обещаний.

Secondary:

- бывшие спортсмены, сравнивающие текущую форму с прошлой;
- специалисты с высокой дисциплиной и низким восстановлением;
- люди с большим количеством начатых систем;
- пользователи habit/fitness-приложений, которым не хватает смысла и сюжета.

Не целевая аудитория: люди, которым нужен медицинский диагноз, лечение, индивидуальный рацион или программа реабилитации. Интерфейс должен перенаправлять к квалифицированной помощи при соответствующем риске.

## 3. Experience pillars

### 3.1 Consequence, not confetti

После действия игрок видит причинную связь: реплика персонажа, состояние комнаты, posture layer, доступный вариант диалога, изменение плана. Конфетти, громкие серии и shame copy запрещены.

### 3.2 Adult ambiguity

Выборы не делятся на добрый/злой. Пример: попросить поддержку повышает Связи, но может временно снизить репутацию самостоятельного человека; удержать обязательство повышает Дисциплину, но при низкой Энергии создаёт risk flag.

### 3.3 Return is a skill

Срыв — обязательный сюжетный beat главы 5. Возвращение измеряется отдельно от серии. Игрок получает статус «Вернувшийся» не за отсутствие пропусков, а за восстановление курса после двух разрывов.

### 3.4 Visible life

Герой, квартира, LAB и Meridian меняются через состояние. Косметика выражает историю, но не усиливает performance.

## 4. Core loop

### Session loop, 3–12 минут

1. Today показывает одну сюжетную ситуацию и до трёх точных действий.
2. Игрок выбирает текущую capacity: low / normal / high.
3. Система предлагает минимальную, стандартную и расширенную версии.
4. Игрок выполняет действие вне интерфейса.
5. Подтверждение: manual по умолчанию; health signal — только с согласия.
6. Применяются immediate effects.
7. Следующая сцена отражает выбор либо ставит delayed consequence.
8. Игрок выходит без искусственного удержания.

### Weekly loop

- review без оценки личности;
- изменение одного параметра;
- один relationship beat;
- один upgrade личного пространства;
- один recovery choice;
- сюжетный checkpoint.

### Season loop

14 глав: построение → срыв → возвращение → испытание → выбор идентичности. Восемь финалов рассчитываются по характеристикам, отношениям и факту возвращений.

## 5. Six stats

| Стат | Что отражает | Растёт от | Риск перекоса |
|---|---|---|---|
| Тело | сила, техника, движение | тренировка, мобильность, прогулка | нагрузка поверх боли |
| Энергия | сон и восстановление | сон, пауза, снижение intensity | пассивность без направления |
| Баланс | питание и регулярность | вода, structure, planning | чрезмерный контроль |
| Разум | наблюдение и обучение | reflection, skill, reframing | analysis paralysis |
| Дисциплина | завершение и возврат | minimum viable action | выгорание при низкой Энергии |
| Связи | доверие и границы | просьба, поддержка, честное «нет» | зависимость от внешней оценки |

Шкалы 0–100 не являются диагнозом или рейтингом личности. Значение — доступ к affordances, не мораль.

### Derived states

- Overdrive: Дисциплина ≥ 70 и Энергия < 30.
- Isolated competence: Разум ≥ 65 и Связи < 30.
- Fragile momentum: серия ≥ 7 и возвратов = 0.
- Sustainable growth: минимум четыре stats ≥ 55, Энергия ≥ 45.
- Recovery mode: stress ≥ 8 или два пропуска подряд.

Derived state меняет copy, рекомендуемую интенсивность и выборы, но не блокирует основную историю.

## 6. Origins

### Потерянная форма

Конфликт: стыд вызывает избегание. Старт: низкие Тело/Баланс, средний Разум. Особый выбор — зеркало без измерения. Риск — компенсирующая тренировка.

### Выгоревший достигатор

Конфликт: отдых воспринимается как слабость. Высокая Дисциплина, критически низкая Энергия. Система чаще предлагает reduction choice.

### Несобранный потенциал

Конфликт: новизна приятнее продолжения. Высокий Разум, низкая Дисциплина. Особая механика — ограничение одновременно активных контрактов.

### Возвращение чемпиона

Конфликт: прошлый уровень делает постепенность унизительной. Тело и Дисциплина выше, Энергия средняя. Риск — игнорирование модификаций.

Origin не является классом и не ограничивает финал.

## 7. Classes as emergent identities

Класс формируется после главы 4 по поведению:

- Атлет — Тело + Дисциплина;
- Стратег — Разум + Баланс;
- Исследователь — Разум + разнообразие действий;
- Наставник — Связи + community actions;
- Восстановитель — Энергия + успешные возвраты.

Класс даёт косметический язык, relationship affordances и варианты рефлексии. Он не создаёт pay-to-win.

## 8. Real actions

Каждое действие имеет:

- `id`, category, capacity tier;
- длительность и минимальную версию;
- противопоказания/stop conditions;
- способы подтверждения;
- награду и daily cap;
- privacy class;
- локализованный текст;
- substitution group.

### Activity

1324 упражнения фильтруются по equipment, muscles, pattern, level и contraindication tags. Игрок не получает автоматический prescription. Для боли: остановиться, уменьшить нагрузку, выбрать контролируемую альтернативу; сохраняющаяся боль требует оценки специалиста.

### Sleep

Механика оценивает окно сна, субъективное восстановление и стабильность, а не «идеальные восемь часов». Health data опциональны.

### Nutrition

Mifflin–St Jeor — стартовая оценка TDEE. Коррекция не чаще одного параметра после 14 дней наблюдений. Запрещены компенсирующее голодание, crash targets и language of guilt.

### Psychology

Короткая check-in модель: состояние → триггер → потребность → следующий безопасный шаг. Это self-reflection, не терапия. Crisis content не генерируется; показывается локально подготовленная safety route.

## 9. Narrative structure

Сезон хранится в schema v4:

- 14 chapter objects;
- 140 sequential scenes;
- 420 choices;
- 70 consequences с триггером через три сцены;
- 8 priority endings.

Каждая сцена содержит beat, location, speaker, warnings, accessibility и analytics funnel. Каждый выбор содержит intent, telegraph, cost, immediate effects и delayed consequence reference.

Канонический путь полностью offline. Система не вызывает AI для продолжения сюжета.

## 10. Relationships

Шкала -10…10 интерпретируется как динамика, а не affection score.

Axes:

- trust — верят ли словам игрока;
- respect — выдерживает ли игрок последствия;
- openness — безопасно ли персонажу быть уязвимым;
- tension — сколько конфликта не переработано;
- boundary memory — помнит ли система согласие и отказ.

Положительное отношение не означает романтический доступ. Romance отсутствует в сезоне 1, пока не определены age rating, consent design и content policy.

## 11. Economy

| Ресурс | Источник | Расход | Ограничение |
|---|---|---|---|
| XP | действия/сцены | уровень | не покупается |
| Momentum | последовательность/возврат | сложные действия | мягкий cap |
| Material | реальные действия | квартира/LAB | косметика и пространство |
| Focus | сон/reflection | сложные реплики | восстанавливается, не продаётся |
| Reputation | community choices | social access | не рейтинг личности |

Monetization: season pass, cosmetic packs, optional authored programs. Запрещены stat boosts, loot boxes, paid recovery, платные «правильные» ответы и манипулятивные countdown.

## 12. Player state and save

Save schema v6:

- profile/origin;
- six stats;
- resources;
- chapter/scene;
- flags and relationships;
- choice history;
- delayed queue;
- quest completion;
- room levels;
- consent per feature;
- return count.

Сохранение локальное с backup. Cloud sync — optional, encrypted in transit, conflict resolution by field category, never silent overwrite.

## 13. Accessibility

- touch target ≥ 44 px;
- controller-only navigation;
- screen reader labels and semantic order;
- 200% text scaling without clipped action;
- reduced motion;
- soft high-legibility palette;
- subtitles for every meaningful voice line;
- audio cues duplicated visually;
- no color-only state;
- time-independent alternatives for reflex interactions.

## 14. Telemetry

По умолчанию выключена. После consent собираются product events без journal text, nutrition free text, health samples or dialogue content. Разрешены: funnel step, action category, error code, performance bucket, retention cohort.

North-star: доля игроков, которые после первого срыва выполняют одно минимальное действие в течение семи дней.

Guardrails:

- количество compulsive sessions > 8/day;
- доля copy-triggered dismissals;
- health permission denial;
- delete-data completion;
- crash-free sessions;
- return without notification pressure.

## 15. Definition of done

Feature считается выполненной, когда есть:

1. design contract;
2. localized UI;
3. state transition;
4. persistence;
5. keyboard/controller/touch path;
6. accessibility labels;
7. offline behavior;
8. analytics decision;
9. test case;
10. failure state.

Артефакт без этих пунктов считается prototype, даже если визуально выглядит завершённым.
