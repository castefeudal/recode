# Art Bible — Meridian Noir

## Направление

Premium editorial × cinematic graphic novel × urban realism. Meridian выглядит взрослым, материальным и немного холодным: мокрый камень, стекло, тёплые окна, направленный свет. Запрещены дешёвый neon-cyberpunk, mobile-casino gloss, героизация истощения и изображения до/после.

## Палитра и иерархия

- Obsidian — основной фон и тишина.
- Platinum — читаемый текст и neutral controls.
- Gold — один ключевой выбор, прогресс или перелом; не декоративная заливка всего экрана.
- Warm skin/light — человеческий контрапункт холодному городу.
- Red используется только для опасности/конфликта и всегда дублируется текстом/формой.

## Композиция

- Desktop hero: 16:10 или 16:9, персонаж/фокус не пересекает основную типографику.
- Mobile crop: проверять 390×844 и safe areas; лицо не под bottom navigation.
- Portrait: 4:5, eye line в верхних 40%, neutral background, минимум мелких деталей.
- Map: районы различимы формой и подписью, без ложной географической точности.

## Фактический asset set 6.0.0

6.0 добавляет отдельные desktop/mobile hero sources и ансамбль Meridian.
Production использует AVIF/WebP/PNG fallbacks из `web_app/public/art/key/`;
исходные PNG и prompts поставляются в Media Kit.

- 2 cinematic source key art + оптимизированные WebP runtime variants;
- 1 Meridian aerial map;
- 8 production character portraits;
- procedural SVG library для UI/items/spaces и legacy emotion placeholders.

Полный набор уникальных эмоций каждого персонажа, store capsules и animated state art остаются production task. Legacy SVG нельзя называть финальным portrait art.

## Экспорт

Web: WebP quality 80–86, responsive CSS crop, meaningful `alt`; не переносить source PNG в public. Store: экспортировать отдельные crops из originals, не растягивать web asset. Проверять banding, лицо, текстовое safe zone, вес и отсутствие remote URLs.

## Prompt contract

Промты и визуальные ограничения находятся в `art_prompts/VISUAL_PROMPTS.md`. Любая новая генерация должна сохранять возраст, внешность, одежду и световую логику персонажа; likeness/trademark review обязателен перед продажей.
