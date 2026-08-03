# Audio Bible

## Роль

Звук поддерживает концентрацию и последствия, а не манипулирует тревогой. Каналы: music, ambient, SFX, voice. Каждый отключается отдельно; voice всегда имеет текстовый эквивалент.

## Состояния

- Meridian: низкая плотность, воздух и город;
- Decision: короткий акцент без «победного автомата»;
- Setback: тише и уже, без наказующего диссонанса;
- Recovery: мягкое расширение спектра;
- Ending: отдельная тема/вариация на финальную последовательность.

## Требования

- UI sound ≤120 мс, без резкого transient и частого повторения;
- loudness/mix проверяются на headphones, laptop и phone;
- reduced stimulation mode отключает nonessential layers;
- приложение уважает mute/silent mode и не запускает audio до user gesture;
- никакой copyrighted music или remote stream;
- subtitles/transcript для любой смысловой реплики.

## Фактический статус

Локальные procedural WAV/UI/ambient assets, если присутствуют в сборке, являются функциональными placeholders, а не финальным soundtrack. Для коммерческого релиза нужны human-directed composition, eight ending cues, mix/master, loop QA и юридический cue sheet. Voice acting не включён.
