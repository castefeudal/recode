# Accessibility

## Реализованный baseline

- semantic buttons/labels и видимый `:focus-visible`;
- touch targets не менее 44 px;
- keyboard navigation и отсутствие hover-only core actions;
- responsive 390/768/1440 layouts и safe-area padding;
- RU/EN system font stack с кириллицей;
- reduced-motion media query и отключение больших transforms;
- состояния дублируются текстом, а не только цветом;
- содержательные `alt` для narrative art;
- настройки text/UI scale, contrast, subtitles, vibration and content warnings в platform contract.

## Обязательная ручная матрица

1. Keyboard-only: onboarding → action → story → export/delete.
2. NVDA/Chrome и VoiceOver/Safari: headings, landmarks, labels, change announcements.
3. Zoom 200% и 400%: нет hidden CTA или horizontal page scroll.
4. 390×844/768×1024/1440×900, portrait/landscape and safe areas.
5. Reduced motion, high contrast, forced colors.
6. Controller-only Godot и Steam Deck virtual keyboard.
7. TalkBack/VoiceOver на native builds.

## Release rule

Автоматическая semantic проверка не равна accessibility certification. Любой P0/P1 в основном пути блокирует релиз; known P2 документируется с owner и датой исправления.
