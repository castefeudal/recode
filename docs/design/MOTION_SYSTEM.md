# Motion System

## Tokens

| Token | Duration | Use |
|---|---:|---|
| instant | 90 ms | press and state acknowledgement |
| fast | 160 ms | hover, focus, small disclosure |
| standard/base | 260 ms | component and panel transitions |
| slow | 440 ms | section entrance and contextual change |
| cinematic | 720 ms | rare hero or narrative emphasis |

Easings are centralised as standard, emphasised and exit curves.

## Rules

- Animate opacity and transforms where possible.
- Never delay input to complete an effect.
- Loading geometry is stable to reduce layout shift.
- Narrative transitions reinforce state hierarchy rather than simulate a cutscene.
- Decorative button sheen and entrance motion are disabled in reduced-motion mode.

## Reduced motion

Both `prefers-reduced-motion: reduce` and the in-product preference are supported. The system removes decorative animation, smooth scrolling and transition latency while leaving state changes and focus movement intact.
