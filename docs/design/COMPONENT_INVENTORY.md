# Component Inventory

## Implemented primitives

| Area | Components |
|---|---|
| Actions | `Button`, `IconButton`, `TextLink`, `Choice` |
| Inputs | `Field`, `TextAreaField`, `SelectField`, `CheckboxField`, `RadioGroup`, `Switch`, `SliderField` |
| Navigation | `Tabs`, `SegmentedControl`, `AppHeader`, `AppFooter` |
| Overlays | `DialogFrame`, `Sheet`, `Popover`, `Dropdown`, `Tooltip`, `ToastMessage` |
| Feedback | `Alert`, `StatusIndicator`, `ProgressBar`, `Skeleton`, `EmptyState`, `Badge` |
| Content | `Card`, `NarrativeCard`, `StatBlock`, `Timeline`, `Avatar`, `ResponsiveImage` |
| Iconography | Typed inline SVG `Icon` set for product navigation and utility controls |

## Required states

The CSS system covers default, hover, active, focus-visible, selected/pressed, disabled, loading/skeleton, success, warning, danger, mobile/touch and reduced-motion behaviour. Existing runtime controls continue to use their established classes but inherit the same foundations and semantic tokens.

## Integrated product surfaces

- Landing and product proof.
- Three-step consent/onboarding.
- Global app rail, mobile bottom navigation and top resource bar.
- Today dashboard and action outcomes.
- Narrative scene, real action and choices.
- Quests, body, nutrition, recovery, mind, relationships, work/money, city and profile.
- Cloud consent, login, registration, sync and revision conflict states.
- Import/export, destructive actions, offline and PWA update states.

## Icon policy

Icons use one 24×24 stroke system and inherit current colour. Critical meaning is paired with text or an accessible label; decorative SVGs are hidden from assistive technology.
