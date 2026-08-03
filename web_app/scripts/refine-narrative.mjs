import { readFileSync, writeFileSync } from "node:fs";

const publicPath = new URL("../public/content/season_01.json", import.meta.url);
const sourcePath = new URL("../content/season_01.json", import.meta.url);
const campaign = JSON.parse(readFileSync(publicPath, "utf8"));

const chapterTexture = {
  prologue: {
    ru: ["забытый таймер мигает на кухне", "дождь дробит отражение в окне", "неоткрытое сообщение остаётся на столе"],
    en: ["a forgotten timer blinks in the kitchen", "rain fractures the reflection in the window", "an unopened message remains on the table"],
    ruVoice: "Мира говорит негромко, оставляя паузы там, где обычно появляется оправдание",
    enVoice: "Mira speaks quietly, leaving silence where an excuse would normally appear",
  },
  ch01: {
    ru: ["сканер LAB гасит последнюю строку отчёта", "цифры отражаются в тёмном стекле", "на измерительной платформе остаётся мокрый след обуви"],
    en: ["the LAB scanner dims the final row of the report", "numbers reflect in the dark glass", "a wet footprint remains on the assessment platform"],
    ruVoice: "Павел отделяет наблюдение от приговора и не позволяет спрятаться за мотивационной речью",
    enVoice: "Pavel separates observation from verdict and refuses to hide behind a motivational speech",
  },
  ch02: {
    ru: ["в Северной галерее закрывают дальний зал", "тонкая золотая линия делит расписание на обещание и факт", "Алина снимает со стены слишком идеальный план"],
    en: ["the far wing of the North Gallery closes", "a thin gold line divides the schedule into promise and fact", "Alina takes an over-perfect plan off the wall"],
    ruVoice: "Алина проверяет не силу обещания, а его способность пережить обычный вторник",
    enVoice: "Alina tests not the force of the promise, but whether it can survive an ordinary Tuesday",
  },
  ch03: {
    ru: ["утренний маршрут Meridian идёт против холодного ветра", "турникеты задерживают поток на одну длинную минуту", "Леон сворачивает с привычной короткой дороги"],
    en: ["the Meridian morning route runs into a cold wind", "the gates hold the crowd for one long minute", "Leon leaves the familiar shortcut"],
    ruVoice: "Леон не спорит с сопротивлением — он заставляет его назвать условия",
    enVoice: "Leon does not argue with resistance; he makes it state its terms",
  },
  ch04: {
    ru: ["на площади гаснет табло чужих результатов", "публика расходится после открытой тренировки", "Макс задерживается у пустого пьедестала"],
    en: ["the board of other people's results goes dark", "the crowd disperses after the open session", "Max stays beside the empty podium"],
    ruVoice: "Макс звучит резко, потому что первым узнаёт цену сравнения",
    enVoice: "Max sounds sharp because he recognizes the price of comparison first",
  },
  ch05: {
    ru: ["закрытые двери LAB не реагируют на пропуск", "аварийный свет делает коридор непривычно узким", "Ева складывает отменённый план вчетверо"],
    en: ["the locked LAB doors do not respond to the pass", "emergency light makes the corridor feel unusually narrow", "Eva folds the cancelled plan into quarters"],
    ruVoice: "Ева не утешает и не обвиняет; она ищет точку, из которой ещё возможно вернуться",
    enVoice: "Eva neither comforts nor accuses; she looks for the point from which return is still possible",
  },
  ch06: {
    ru: ["пустой зал усиливает каждый шаг", "на стойке лежит новый пропуск без даты активации", "Павел включает только один ряд света"],
    en: ["the empty hall amplifies every step", "a new pass lies on the desk without an activation date", "Pavel switches on a single row of lights"],
    ruVoice: "Павел говорит о возвращении как об инженерной задаче, а не проверке характера",
    enVoice: "Pavel treats returning as an engineering problem, not a character test",
  },
  ch07: {
    ru: ["под Южным мостом слышно движение воды", "на экране клиники замирает красная траектория", "Вера убирает датчик до повторного теста"],
    en: ["water moves beneath the South Bridge", "a red trajectory freezes on the clinic display", "Vera removes the sensor before a second test"],
    ruVoice: "Вера слышит ограничение раньше, чем амбиция успевает назвать его слабостью",
    enVoice: "Vera hears the limit before ambition can rename it weakness",
  },
  ch08: {
    ru: ["в Саду тишины закрывается стеклянная перегородка", "верхний Meridian звучит дальше обычного", "Никита оставляет между креслами свободное место"],
    en: ["a glass partition closes in the Garden of Silence", "Upper Meridian sounds farther away than usual", "Nikita leaves an empty space between the chairs"],
    ruVoice: "Никита различает границу и стену по тому, остаётся ли возможность ответа",
    enVoice: "Nikita distinguishes a boundary from a wall by whether an answer remains possible",
  },
  ch09: {
    ru: ["неоновая линия рынка отражается в чёрной воде", "быстрое предложение исчезает через семь минут", "Макс держит договор за угол, не касаясь подписи"],
    en: ["the market's neon line reflects in black water", "the fast offer expires in seven minutes", "Max holds the agreement by one corner, away from the signature"],
    ruVoice: "Макс знает язык быстрых побед и поэтому внимательно слушает, что они требуют взамен",
    enVoice: "Max knows the language of quick wins and listens closely to what they demand in return",
  },
  ch10: {
    ru: ["на сороковой день квартира выглядит обжитой, а не завершённой", "Мира переставляет одну вещь и освобождает полку", "утренний свет впервые не похож на экзамен"],
    en: ["on day forty the apartment looks lived in, not completed", "Mira moves one object and clears a shelf", "the morning light no longer resembles an exam"],
    ruVoice: "Мира проверяет, может ли новая роль стать обычной и не требовать ежедневной защиты",
    enVoice: "Mira tests whether the new role can become ordinary without demanding a daily defense",
  },
  ch11: {
    ru: ["аварийный режим отключает привычные маршруты", "городская сеть оставляет только ручные указатели", "Леон отмечает путь мелом на мокром бетоне"],
    en: ["emergency mode disables the familiar routes", "the city network leaves only manual signs", "Leon marks a path in chalk on wet concrete"],
    ruVoice: "Леон убирает удобство, чтобы увидеть, осталось ли направление",
    enVoice: "Leon removes convenience to see whether direction remains",
  },
  ch12: {
    ru: ["над крышей LAB начинает светлеть горизонт", "Павел закрывает итоговый протокол до подписи", "ветер переворачивает пустую последнюю страницу"],
    en: ["the horizon begins to brighten above the LAB roof", "Pavel closes the final protocol before the signature", "wind turns the blank final page"],
    ruVoice: "Павел не предлагает правильный финал — только проверяет, какую систему игрок готов унести с собой",
    enVoice: "Pavel offers no correct ending; he only tests which system the player is prepared to carry forward",
  },
  epilogue: {
    ru: ["рассвет проявляет следы ночного дождя", "районы Meridian включаются не одновременно", "Мира смотрит на город, а не на итоговый экран"],
    en: ["dawn reveals the traces of the night's rain", "Meridian's districts come online at different times", "Mira looks at the city instead of the final display"],
    ruVoice: "Мира говорит о последствиях без торжества: важен не титул, а то, что теперь выдерживает жизнь",
    enVoice: "Mira speaks of consequences without triumph; the title matters less than what life can now sustain",
  },
};

const ruSceneShapes = [
  ({ beat, detail, voice, thesis }) => `${detail[0]}. ${voice}. Тема «${beat}» возникает не как задача на силу воли, а как первая проверка: удастся ли ${thesis}?`,
  ({ beat, detail, speaker }) => `${detail[1]}. ${speaker} просит восстановить последние десять минут без интерпретаций. В истории «${beat}» обнаруживается один факт, который раньше исчезал за общими словами.`,
  ({ beat, detail, speaker }) => `${detail[2]}. ${speaker} кладёт рядом план и то, что произошло на самом деле. Между ними — не провал, а место решения; именно там «${beat}» получает цену.`,
  ({ beat, detail, voice }) => `${detail[0]}; пространство вокруг становится свидетелем разговора. ${voice}. Если выбрать привычную защиту, изменится не только результат — изменится способ, которым мир отвечает на «${beat}».`,
  ({ beat, detail, speaker }) => `${detail[1]}. На секунду кажется, что конфликт «${beat}» уже решён, но ${speaker} замечает слишком удобную формулировку. Ложное облегчение заканчивается там, где нужно назвать следующую проверяемую вещь.`,
  ({ beat, detail, thesis }) => `${detail[2]}. Теперь «${beat}» нельзя оставить идеей: решение должно пережить ближайшие сутки. Вопрос не в эффектности выбора, а в том, поможет ли он ${thesis}.`,
  ({ beat, detail, speaker }) => `${detail[0]}. Последствие предыдущего шага появляется раньше ожидаемого. ${speaker} не исправляет ситуацию за игрока: «${beat}» становится свидетельством того, какой способ действия уже выбран.`,
  ({ beat, detail, voice }) => `${detail[1]}. То, что казалось побочной деталью в сцене «${beat}», меняет смысл разговора. ${voice}; прежняя версия событий больше не объясняет происходящее целиком.`,
  ({ beat, detail, speaker }) => `${detail[2]}. ${speaker} оставляет только два действительно дорогих варианта и один честный выход без героизма. «${beat}» превращается в кризис не из-за масштаба, а из-за необратимости следа.`,
  ({ beat, detail, thesis }) => `${detail[0]}. После решения пространство выглядит почти так же, но маршрут уже другой. «${beat}» закрывает главу конкретным следом и проверяет, удалось ли ${thesis}.`,
];

const enSceneShapes = [
  ({ beat, detail, voice, thesis }) => `${detail[0]}. ${voice}. “${beat}” arrives not as a test of willpower, but as the first test of whether the player can ${thesis}.`,
  ({ beat, detail, speaker }) => `${detail[1]}. ${speaker} asks for the last ten minutes without interpretation. Inside “${beat}” sits one fact that used to disappear behind broad explanations.`,
  ({ beat, detail, speaker }) => `${detail[2]}. ${speaker} places the plan beside what actually happened. The gap is not a failure but a decision point, and “${beat}” now has a price.`,
  ({ beat, detail, voice }) => `${detail[0]}; the room becomes a witness. ${voice}. The familiar defense would change more than the outcome—it would change how the world answers “${beat}.”`,
  ({ beat, detail, speaker }) => `${detail[1]}. For a moment “${beat}” appears solved, until ${speaker} notices the wording is too convenient. Relief ends where the next testable fact must begin.`,
  ({ beat, detail, thesis }) => `${detail[2]}. “${beat}” can no longer remain an idea; the decision has to survive the next real day. Its value is whether it helps the player ${thesis}, not whether it looks decisive.`,
  ({ beat, detail, speaker }) => `${detail[0]}. The previous decision returns sooner than expected. ${speaker} refuses to repair it for the player; “${beat}” becomes evidence of the method already chosen.`,
  ({ beat, detail, voice }) => `${detail[1]}. A detail that looked incidental in “${beat}” changes the meaning of the conversation. ${voice}; the old account of events no longer explains enough.`,
  ({ beat, detail, speaker }) => `${detail[2]}. ${speaker} leaves two genuinely costly options and one honest exit without heroics. “${beat}” becomes a crisis through the permanence of its trace, not its scale.`,
  ({ beat, detail, thesis }) => `${detail[0]}. The room looks almost unchanged after the decision, but the route is different. “${beat}” closes the chapter with a visible trace and tests whether the player can ${thesis}.`,
];

const ruDialogueShapes = [
  ({ speaker, beat }) => `${speaker}: «Не защищай “${beat}” объяснением. Назови, что ты готов проверить до следующей встречи».`,
  ({ speaker, beat }) => `${speaker}: «Если убрать оценку, что в “${beat}” останется фактом — и какой факт ты создашь следующим?»`,
  ({ speaker, beat }) => `${speaker}: «Цена “${beat}” уже существует. Вопрос только в том, выберешь ли ты её сознательно».`,
  ({ speaker, beat }) => `${speaker}: «Из “${beat}” можно уйти без наказания. Но выбери способ ухода, который не заставит тебя исчезнуть».`,
  ({ speaker, beat }) => `${speaker}: «Слишком красивый ответ сейчас опаснее молчания. Что в “${beat}” можно сделать настоящим?»`,
  ({ speaker, beat }) => `${speaker}: «Не обещай новую жизнь из-за “${beat}”. Покажи один поступок, который выдержит сегодняшний контекст».`,
  ({ speaker, beat }) => `${speaker}: «Последствие — не приговор. Это ответ мира на способ, которым ты прошёл “${beat}”».`,
  ({ speaker, beat }) => `${speaker}: «В “${beat}” ты заметил деталь, которую раньше вычёркивал. Теперь прежнее решение уже нельзя повторить вслепую».`,
  ({ speaker, beat }) => `${speaker}: «У “${beat}” нет бесплатного варианта. Есть только цена, которую ты выбираешь сам, и цена, которая выбирает тебя».`,
  ({ speaker, beat }) => `${speaker}: «“${beat}” закончится не выводом. Сцена закончится тем, что останется работать завтра».`,
];

const enDialogueShapes = [
  ({ speaker, beat }) => `${speaker}: “Do not defend ‘${beat}’ with an explanation. Name what you will test before we meet again.”`,
  ({ speaker, beat }) => `${speaker}: “Remove the verdict. What remains factual in ‘${beat}’—and which fact will you create next?”`,
  ({ speaker, beat }) => `${speaker}: “The cost of ‘${beat}’ already exists. The only question is whether you choose it deliberately.”`,
  ({ speaker, beat }) => `${speaker}: “You may leave ‘${beat}’ without punishment. Choose a way of leaving that does not require you to disappear.”`,
  ({ speaker, beat }) => `${speaker}: “A beautiful answer is more dangerous than silence right now. What can make ‘${beat}’ real?”`,
  ({ speaker, beat }) => `${speaker}: “Do not promise a new life because of ‘${beat}.’ Show me one action that can survive today's context.”`,
  ({ speaker, beat }) => `${speaker}: “A consequence is not a verdict. It is the world's answer to how you moved through ‘${beat}.’”`,
  ({ speaker, beat }) => `${speaker}: “Inside ‘${beat}’ you noticed the detail you used to edit out. The old decision can no longer repeat blindly.”`,
  ({ speaker, beat }) => `${speaker}: “‘${beat}’ has no free option—only the price you choose and the price that chooses you.”`,
  ({ speaker, beat }) => `${speaker}: “‘${beat}’ will not end with a conclusion. It will end with whatever still works tomorrow.”`,
];

const choiceLanguage = {
  discipline: {
    ru: ["Зафиксировать один выполнимый срок", "Закрыть минимальную версию без расширения задачи", "Убрать лишнее и оставить обязательное", "Назначить точку проверки вместо новой клятвы", "Сделать первый шаг до обсуждения мотивации", "Ограничить работу одним завершённым циклом", "Продолжить по плану, но уменьшить обещание", "Записать правило, которое выдержит плохой день", "Выбрать повторяемость вместо впечатления", "Оставить после сцены одно точное обязательство"],
    en: ["Set one survivable deadline", "Finish the minimum version without expanding the task", "Remove the optional and keep the essential", "Set a review point instead of making another vow", "Take the first step before discussing motivation", "Limit the work to one completed cycle", "Continue the plan with a smaller promise", "Write a rule that can survive a bad day", "Choose repeatability over impression", "Leave the scene with one exact commitment"],
  },
  energy: {
    ru: ["Снизить нагрузку до восстанавливаемого уровня", "Защитить сегодняшний сон ценой скорости", "Отменить один лишний долг перед собой", "Перенести усилие, сохранив направление", "Остановиться до того, как остановит тело", "Выбрать темп, который не потребует расплаты завтра", "Вернуть паузу в расписание без оправданий", "Сократить объём, но не исчезнуть", "Признать усталость входным условием", "Закрыть день раньше, оставив маршрут открытым"],
    en: ["Reduce the load to a recoverable level", "Protect tonight's sleep at the cost of speed", "Cancel one unnecessary debt to yourself", "Delay the effort while preserving direction", "Stop before the body is forced to stop you", "Choose a pace that creates no debt tomorrow", "Return a pause to the schedule without apology", "Reduce the volume without disappearing", "Treat fatigue as an input condition", "Close the day early while keeping the route open"],
  },
  balance: {
    ru: ["Собрать следующий нейтральный приём пищи", "Не компенсировать вчерашнее ограничением", "Вернуть базовую структуру без наказания", "Выбрать достаточно хороший вариант", "Отделить голод от оценки себя", "Записать факт без морализации", "Сохранить регулярность ценой идеальности", "Проверить потребность до автоматического решения", "Оставить место для обычной жизни", "Выбрать устойчивость вместо краткого контроля"],
    en: ["Build the next neutral meal", "Refuse to compensate for yesterday through restriction", "Restore basic structure without punishment", "Choose the good-enough option", "Separate hunger from self-evaluation", "Record the fact without moral judgment", "Protect regularity at the cost of perfection", "Check the need before making the automatic choice", "Leave room for ordinary life", "Choose sustainability over brief control"],
  },
  mind: {
    ru: ["Назвать происходящее без диагноза себе", "Отделить мысль от факта", "Записать страх одной прямой фразой", "Не спорить с эмоцией, а определить её функцию", "Попросить минуту до автоматического ответа", "Проверить интерпретацию на одном факте", "Оставить вопрос открытым без самоприговора", "Признать сопротивление, не отдавая ему управление", "Сформулировать, что действительно неизвестно", "Выбрать ясность вместо убедительного объяснения"],
    en: ["Name what is happening without diagnosing yourself", "Separate the thought from the fact", "Write the fear in one direct sentence", "Identify the emotion's function instead of arguing with it", "Ask for one minute before the automatic answer", "Test the interpretation against one fact", "Leave the question open without a verdict", "Acknowledge resistance without giving it control", "State what is genuinely unknown", "Choose clarity over a persuasive explanation"],
  },
  connections: {
    ru: ["Попросить конкретную поддержку", "Обозначить границу и оставить возможность ответа", "Сказать правду без требования немедленного согласия", "Признать влияние своего решения на другого", "Отказаться от удобства, сохранив контакт", "Задать прямой вопрос вместо догадки", "Не спасать другого ценой собственного ресурса", "Вернуться к разговору после паузы", "Назвать ожидание до того, как оно станет обидой", "Выбрать честную близость вместо управляемой дистанции"],
    en: ["Ask for specific support", "State a boundary while leaving room for an answer", "Tell the truth without demanding immediate agreement", "Acknowledge how your decision affects someone else", "Give up convenience while preserving contact", "Ask directly instead of guessing", "Refuse to rescue someone at the cost of your own capacity", "Return to the conversation after a pause", "Name the expectation before it becomes resentment", "Choose honest closeness over controlled distance"],
  },
  body: {
    ru: ["Выбрать контролируемое движение", "Остановить подход до боли", "Уменьшить амплитуду и сохранить качество", "Заменить доказательство технической работой", "Проверить сигнал тела без драматизации", "Выбрать восстановление вместо дополнительного объёма", "Оставить запас, а не рекорд", "Сделать короткую мобильность вместо наказания", "Скорректировать план по фактическому состоянию", "Закончить движение с ощущением продолжения"],
    en: ["Choose controlled movement", "Stop the set before pain", "Reduce the range while preserving quality", "Replace proving with technical work", "Check the body's signal without dramatizing it", "Choose recovery over additional volume", "Leave capacity in reserve instead of chasing a record", "Do brief mobility instead of punishment", "Adjust the plan to the body's actual state", "Finish the movement with the ability to continue"],
  },
};

const statNames = {
  discipline: { ru: "дисциплину", en: "discipline" },
  energy: { ru: "энергию", en: "energy" },
  balance: { ru: "баланс", en: "balance" },
  mind: { ru: "ясность", en: "clarity" },
  connections: { ru: "связь", en: "connection" },
  body: { ru: "контакт с телом", en: "body awareness" },
};

for (const scene of campaign.scenes) {
  const chapter = campaign.chapters.find((item) => item.id === scene.chapter_id);
  const texture = chapterTexture[scene.chapter_id];
  const index = Math.max(0, Math.min(9, scene.order - 1));
  const ruInput = {
    beat: scene.beat.ru,
    detail: texture.ru,
    voice: texture.ruVoice,
    thesis: chapter.thesis.ru,
    speaker: scene.speaker.ru,
  };
  const enInput = {
    beat: scene.beat.en,
    detail: texture.en,
    voice: texture.enVoice,
    thesis: chapter.thesis.en,
    speaker: scene.speaker.en,
  };
  scene.text = {
    ru: ruSceneShapes[index](ruInput),
    en: enSceneShapes[index](enInput),
  };
  scene.dialogue = {
    ru: ruDialogueShapes[index]({ speaker: scene.speaker.ru, beat: scene.beat.ru }),
    en: enDialogueShapes[index]({ speaker: scene.speaker.en, beat: scene.beat.en }),
  };
  if (scene.real_action) {
    const prompts = [
      { ru: `За ${scene.real_action.minutes} минут запиши один наблюдаемый факт о «${scene.beat.ru}» и сделай действие, которое можно проверить без оценки себя.`, en: `In ${scene.real_action.minutes} minutes, write one observable fact about “${scene.beat.en}” and complete an action that can be checked without self-judgment.` },
      { ru: `Уменьши «${scene.beat.ru}» до шага на ${scene.real_action.minutes} минут. После него запиши, что реально изменилось.`, en: `Reduce “${scene.beat.en}” to a ${scene.real_action.minutes}-minute step. Record what actually changed afterward.` },
      { ru: `Выбери действие по теме «${scene.beat.ru}», которое не потребует компенсации завтра. Ограничение: ${scene.real_action.minutes} минут.`, en: `Choose a ${scene.real_action.minutes}-minute action for “${scene.beat.en}” that creates no compensation debt tomorrow.` },
    ];
    scene.real_action.prompt = prompts[(scene.order + chapter.order) % prompts.length];
  }
}

for (const choice of campaign.choices) {
  const scene = campaign.scenes.find((item) => item.id === choice.scene_id);
  const chapter = campaign.chapters.find((item) => item.id === scene.chapter_id);
  const sceneChoiceIndex = scene.choices.indexOf(choice.id);
  const phraseIndex = (scene.order - 1 + sceneChoiceIndex * 3 + chapter.order) % 10;
  const language = choiceLanguage[choice.intent];
  choice.text = {
    ru: `${language.ru[phraseIndex]} — «${scene.beat.ru}»`,
    en: `${language.en[phraseIndex]} — “${scene.beat.en}”`,
  };
  const routeNote = choice.route_effect
    ? { ru: "Этот способ откроет один маршрут и закроет две альтернативы.", en: "This approach opens one route and closes two alternatives." }
    : { ru: "Последствие проявится в отношениях или следующей сцене.", en: "The consequence will surface in a relationship or later scene." };
  choice.telegraph = {
    ru: `Усилит ${statNames[choice.intent].ru}. ${routeNote.ru}`,
    en: `Strengthens ${statNames[choice.intent].en}. ${routeNote.en}`,
  };
}

campaign.design_contract = {
  ...campaign.design_contract,
  editorial_rewrite: "7.0",
  semantic_repetition_gate: true,
  human_review_claimed: false,
};

const output = `${JSON.stringify(campaign, null, 2)}\n`;
writeFileSync(publicPath, output);
writeFileSync(sourcePath, output);
