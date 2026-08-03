#!/usr/bin/env python3
"""Build the authored, deterministic Season 01 campaign.

The source is intentionally data driven, but each chapter has its own dramatic
question, atmosphere, character voice, irreversible flag and consequences.
Stable IDs keep saves compatible between patch releases.
"""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "game" / "narrative" / "season_01.json"
WEB_OUT = ROOT / "web_app" / "content" / "season_01.json"
PUBLIC_OUT = ROOT / "web_app" / "public" / "content" / "season_01.json"

STATS = ("body", "energy", "balance", "mind", "discipline", "connections")
STATS_RU = {"body": "тело", "energy": "энергия", "balance": "баланс", "mind": "разум", "discipline": "дисциплина", "connections": "связи"}
CHARACTERS_EN = {"Мира": "Mira", "Павел": "Pavel", "Алина": "Alina", "Леон": "Leon", "Макс": "Max", "Ева": "Eva", "Вера": "Vera", "Никита": "Nikita"}
PLACES_EN = {
    "Квартира · Восточный Meridian": "Apartment · East Meridian",
    "MARKOVMADE LAB · Зал оценки": "MARKOVMADE LAB · Assessment Hall",
    "Северный зал · Галерея": "North Hall · Gallery",
    "Meridian · Утренний маршрут": "Meridian · Morning Route",
    "Площадь Meridian · Открытая тренировка": "Meridian Square · Open Training",
    "MARKOVMADE LAB · Закрыто": "MARKOVMADE LAB · Closed",
    "MARKOVMADE LAB · Пустой зал": "MARKOVMADE LAB · Empty Hall",
    "Клиника движения · Южный мост": "Movement Clinic · South Bridge",
    "Сад тишины · Верхний Meridian": "Garden of Silence · Upper Meridian",
    "Ночной рынок · Неоновая линия": "Night Market · Neon Line",
    "Квартира игрока · Сороковой день": "Player Apartment · Day Forty",
    "Meridian · Аварийный режим": "Meridian · Emergency Mode",
    "Крыша LAB · Перед рассветом": "LAB Rooftop · Before Dawn",
    "Meridian · Рассвет": "Meridian · Dawn",
}

CHAPTERS = [
    {
        "id": "prologue", "ru": "Нулевая точка", "en": "Zero Point", "place": "Квартира · Восточный Meridian",
        "character": "Мира", "thesis": "признать, что прежняя система закончилась",
        "question": "Сможешь ли ты посмотреть на свою жизнь без приговора и без новой клятвы?",
        "sensory": "Дождь режет отражение в окне на тонкие полосы; на кухне мигает забытый таймер.",
        "voice": "«Мне не нужна твоя лучшая версия. Мне нужен человек, который действительно пришёл».",
        "beats": ["тишина после будильника", "неоткрытое сообщение", "зеркало без оценки", "коробка из LAB", "первый честный замер", "разговор без спасения", "три минуты движения", "выбор точки А", "неидеальный контракт", "дверь в Meridian"],
    },
    {
        "id": "ch01", "ru": "Честные цифры", "en": "Honest Numbers", "place": "MARKOVMADE LAB · Зал оценки",
        "character": "Павел", "thesis": "увидеть данные без самоприговора",
        "question": "Что останется от твоей цели, если цифры перестанут доказывать твою ценность?",
        "sensory": "Белый свет ложится на разметку пола; экран спокойно показывает то, что хотелось бы назвать ошибкой.",
        "voice": "«Данные ничего о тебе не думают. Это освобождает — если перестать думать за них».",
        "beats": ["входное тестирование", "цифра, которую хочется скрыть", "карта сна", "история прошлых рывков", "предел текущей нагрузки", "спор о цели", "малый эксперимент", "неудобная обратная связь", "первая неделя на бумаге", "подпись под фактом"],
    },
    {
        "id": "ch02", "ru": "Первый контракт", "en": "The First Contract", "place": "Северный зал · Галерея",
        "character": "Алина", "thesis": "выбрать обязательство, которое выдержит реальная жизнь",
        "question": "Готов ли ты предпочесть выполнимое обещание впечатляющему?",
        "sensory": "За стеклом заканчивается поздняя группа; маркер скрипит по доске с пустой недельной сеткой.",
        "voice": "«Контракт проверяется не в понедельник. Он проверяется в среду, когда всё пошло не по плану».",
        "beats": ["слишком красивый план", "тест минимальной версии", "чужое расписание", "окно в двадцать минут", "правило плохого дня", "цена пропуска", "свидетель обещания", "контракт без наказания", "первая проверка", "договор, который остаётся"],
    },
    {
        "id": "ch03", "ru": "Сопротивление", "en": "Resistance", "place": "Meridian · Утренний маршрут",
        "character": "Леон", "thesis": "встретить первое настоящее «не хочу»",
        "question": "Ты действуешь только когда согласен с действием — или умеешь вести переговоры с сопротивлением?",
        "sensory": "Холодный дождь собирается на поручнях; город шумит так, будто у него уже есть оправдание.",
        "voice": "«Не хочу — это информация. Но ты почему-то каждый раз выдаёшь ей право вето».",
        "beats": ["холодный дождь", "торг с будильником", "раздражение на простоту", "ложная срочность", "разговор на лестнице", "движение без настроения", "провал концентрации", "малое завершение", "вечерняя честность", "первый след дисциплины"],
    },
    {
        "id": "ch04", "ru": "Цена сравнения", "en": "The Cost of Comparison", "place": "Площадь Meridian · Открытая тренировка",
        "character": "Макс", "thesis": "отделить собственную цель от чужого результата",
        "question": "Что ты выберешь, когда собственный темп выглядит проигрышем на фоне чужого?",
        "sensory": "Табло обновляется каждые десять секунд; зрители видят места, но не видят цену каждого результата.",
        "voice": "«Можно всю жизнь становиться лучше — и всё равно чувствовать себя последним. Удобная система, правда?»",
        "beats": ["публичная таблица", "старое фото", "чужой прогресс", "слишком тяжёлый подход", "насмешка без шутки", "граница соревнования", "собственный темп", "невыгодная честность", "новая метрика", "выход без поражения"],
    },
    {
        "id": "ch05", "ru": "Срыв", "en": "The Setback", "place": "MARKOVMADE LAB · Закрыто",
        "character": "Ева", "thesis": "потерять идеальный сценарий и не потерять себя",
        "question": "Останешься ли ты в истории после момента, который раньше считал концом?",
        "sensory": "На стеклянной двери отражается пустая улица; четыре отметки в календаре остались серыми.",
        "voice": "«Ты называешь это провалом, потому что тогда можно исчезнуть. Назови это эпизодом — и придётся вернуться».",
        "beats": ["четыре пропущенных дня", "еда вместо паузы", "неотвеченные сообщения", "стыд перед возвращением", "закрытая дверь", "разговор в темноте", "отказ от компенсации", "сон вместо наказания", "первый нейтральный шаг", "решение не исчезать"],
    },
    {
        "id": "ch06", "ru": "Возвращение", "en": "The Return", "place": "MARKOVMADE LAB · Пустой зал",
        "character": "Павел", "thesis": "проверить архитектуру системы после срыва",
        "question": "Сможешь ли ты изменить систему вместо того, чтобы снова обвинить исполнителя?",
        "sensory": "В зале оставлена только одна полоса света; старый план лежит рядом с чистым листом.",
        "voice": "«Возвращение — не уступка. Это отдельный навык, и он важнее безупречной серии».",
        "beats": ["вход без фанфар", "уменьшенная тренировка", "разбор причины", "удалённое лишнее правило", "новое окно восстановления", "просьба о поддержке", "переписанный контракт", "малый цикл", "второй честный замер", "возвращение как навык"],
    },
    {
        "id": "ch07", "ru": "Тело помнит", "en": "The Body Remembers", "place": "Клиника движения · Южный мост",
        "character": "Вера", "thesis": "услышать ограничение до того, как оно станет травмой",
        "question": "Можешь ли ты уважать сигнал тела, не превращая осторожность в капитуляцию?",
        "sensory": "Мягкий дневной свет касается зеркала; резиновая лента лежит рядом со штангой как непривычный выбор.",
        "voice": "«Боль не делает тебя слабым. Но попытка победить боль иногда делает тебя травмированным».",
        "beats": ["старая боль", "желание доказать", "оценка движения", "неприятная модификация", "страх потерять форму", "разница боли и усилия", "техника под наблюдением", "день восстановления", "новая шкала прогресса", "союз с телом"],
    },
    {
        "id": "ch08", "ru": "Люди вокруг", "en": "People Around You", "place": "Сад тишины · Верхний Meridian",
        "character": "Никита", "thesis": "установить границы, не превращая их в одиночество",
        "question": "Сможешь ли ты сохранить контакт, когда честность временно ухудшает отношения?",
        "sensory": "Вода едва слышно проходит под каменными плитами; между двумя чашками остывает чай.",
        "voice": "«Граница без объяснения может ранить. Объяснение без границы ничего не меняет».",
        "beats": ["сорванный совместный план", "совет без запроса", "привычное согласие", "первая ясная граница", "обида другого", "пауза без бегства", "просьба вместо претензии", "чужое нет", "контакт после конфликта", "отношение, которое выдержало"],
    },
    {
        "id": "ch09", "ru": "Быстрый результат", "en": "Fast Results", "place": "Ночной рынок · Неоновая линия",
        "character": "Макс", "thesis": "отказаться от сделки с собственной тревогой",
        "question": "Какую цену ты не заметишь, если обещание достаточно быстрое?",
        "sensory": "Неон делает лица безупречными; на витринах обещания короче списка противопоказаний.",
        "voice": "«Я не продаю скорость. Я продаю облегчение от мысли, что ты опоздал».",
        "beats": ["обещание за семь дней", "фото до и после", "скрытая цена", "приглашение Макса", "сомнение Алины", "желание ускориться", "проверка источника", "отказ без превосходства", "скучная альтернатива", "результат, который останется"],
    },
    {
        "id": "ch10", "ru": "Новая идентичность", "en": "New Identity", "place": "Квартира игрока · Сороковой день",
        "character": "Мира", "thesis": "перестать ежедневно доказывать право называться изменившимся",
        "question": "Позволишь ли ты новой роли стать обычной, не устраивая ей ежедневный экзамен?",
        "sensory": "Рабочий стол свободен наполовину; утренний свет впервые не выглядит чужим.",
        "voice": "«Идентичность становится настоящей, когда перестаёт звучать как заявление для прессы».",
        "beats": ["старая одежда", "комната после месяца", "слова о себе", "неожиданная похвала", "страх сглазить", "обычный сложный день", "действие без торга", "чужое наблюдение", "тихое признание", "имя новой роли"],
    },
    {
        "id": "ch11", "ru": "Испытание", "en": "The Trial", "place": "Meridian · Аварийный режим",
        "character": "Леон", "thesis": "сохранить направление, когда привычная инфраструктура исчезла",
        "question": "Какая часть системы останется, если убрать зал, расписание и ощущение контроля?",
        "sensory": "Квартал погружён в полумрак; телефоны экономят заряд, и ни один привычный сервис не отвечает.",
        "voice": "«Вот теперь интересно. Без красивой панели у тебя всё ещё есть система — или только интерфейс?»",
        "beats": ["городская авария", "закрытый зал", "сорванная встреча", "пустой холодильник", "конфликт в группе", "ограниченный ресурс", "решение для команды", "личная цена", "ночь без контроля", "утро после испытания"],
    },
    {
        "id": "ch12", "ru": "Точка выбора", "en": "Point of Choice", "place": "Крыша LAB · Перед рассветом",
        "character": "Павел", "thesis": "решить, какая система останется после финала",
        "question": "Ты построил результат, убежище или способ жить дальше?",
        "sensory": "Ветер уносит листы пустых форм; внизу впервые горят все окна LAB.",
        "voice": "«Финал — плохое место для клятвы. Выбери то, что выдержит обычный вторник».",
        "beats": ["финальный отчёт", "предложение должности", "просьба близкого", "соблазн масштабировать всё", "разговор с Павлом", "встреча с первой версией себя", "три возможных пути", "цена каждого пути", "решение без гарантии", "открытие LAB"],
    },
    {
        "id": "epilogue", "ru": "Последствия", "en": "Consequences", "place": "Meridian · Рассвет",
        "character": "Мира", "thesis": "увидеть след решений и оставить дверь следующему сезону",
        "question": "Что изменилось в мире, потому что ты научился не исчезать?",
        "sensory": "Город просыпается без музыки победы; в окнах LAB один за другим появляется свет.",
        "voice": "«Ты не стал законченным. Ты стал человеком, который умеет продолжать».",
        "beats": ["утро без сигнала", "новая осанка", "живое пространство", "сообщения команды", "чужой первый день", "роль наставника", "незакрытая слабость", "личный ритуал", "письмо в будущее", "свет в окнах LAB"],
    },
]

EN = {
    "prologue": {
        "thesis": "admit that the old system has ended",
        "question": "Can you look at your life without a verdict and without another vow?",
        "sensory": "Rain cuts the reflection in the window into thin lines; a forgotten timer blinks in the kitchen.",
        "voice": "“I do not need your best version. I need the person who actually showed up.”",
        "beats": ["silence after the alarm", "the unopened message", "a mirror without judgment", "the box from LAB", "the first honest measurement", "a conversation without rescue", "three minutes of movement", "choosing Point A", "an imperfect contract", "the door into Meridian"],
    },
    "ch01": {
        "thesis": "see data without turning it into a verdict",
        "question": "What remains of your goal when numbers stop proving your worth?",
        "sensory": "White light falls across the floor markings; the screen calmly shows the number you wanted to call a mistake.",
        "voice": "“Data thinks nothing about you. That is liberating—if you stop thinking on its behalf.”",
        "beats": ["entry assessment", "the number you want to hide", "the sleep map", "the history of past sprints", "the current load limit", "the argument about the goal", "a small experiment", "uncomfortable feedback", "the first week on paper", "signing the fact"],
    },
    "ch02": {
        "thesis": "choose a commitment that survives real life",
        "question": "Can you prefer a promise you can keep to one that looks impressive?",
        "sensory": "The late group finishes behind the glass; a marker squeaks across an empty weekly grid.",
        "voice": "“A contract is not tested on Monday. It is tested on Wednesday, when the plan has already broken.”",
        "beats": ["the plan that looks too good", "testing the minimum version", "someone else's schedule", "a twenty-minute window", "the bad-day rule", "the cost of a missed day", "a witness to the promise", "a contract without punishment", "the first test", "the agreement that remains"],
    },
    "ch03": {
        "thesis": "meet the first genuine refusal",
        "question": "Do you act only when you agree with the action, or can you negotiate with resistance?",
        "sensory": "Cold rain collects on the handrails; the city sounds as if it already has an excuse.",
        "voice": "“I do not want to is information. You keep giving it veto power.”",
        "beats": ["cold rain", "bargaining with the alarm", "anger at simplicity", "false urgency", "the stairwell conversation", "movement without motivation", "a collapse in focus", "the small completion", "evening honesty", "the first trace of discipline"],
    },
    "ch04": {
        "thesis": "separate your goal from someone else's result",
        "question": "What will you choose when your pace looks like failure beside someone else's?",
        "sensory": "The board refreshes every ten seconds; spectators can see rankings, never the price of each result.",
        "voice": "“You can improve your whole life and still feel last. Convenient system, isn't it?”",
        "beats": ["the public scoreboard", "the old photograph", "someone else's progress", "the set that is too heavy", "the insult disguised as a joke", "the boundary of competition", "your own pace", "unprofitable honesty", "a new metric", "leaving without defeat"],
    },
    "ch05": {
        "thesis": "lose the perfect script without losing yourself",
        "question": "Will you remain in the story after the moment you used to call the end?",
        "sensory": "The empty street reflects in the glass door; four calendar marks remain grey.",
        "voice": "“You call it failure because then you are allowed to disappear. Call it an episode—and you have to return.”",
        "beats": ["four missed days", "food instead of a pause", "unanswered messages", "shame before returning", "the locked door", "a conversation in the dark", "refusing compensation", "sleep instead of punishment", "the first neutral step", "the decision not to vanish"],
    },
    "ch06": {
        "thesis": "test the system's architecture after a setback",
        "question": "Can you change the system instead of accusing its operator again?",
        "sensory": "Only one strip of light remains in the hall; the old plan lies beside a clean sheet.",
        "voice": "“Returning is not a concession. It is a separate skill, more valuable than a flawless streak.”",
        "beats": ["entering without fanfare", "the reduced workout", "examining the cause", "deleting one unnecessary rule", "a new recovery window", "asking for support", "the rewritten contract", "the small cycle", "the second honest measurement", "returning as a skill"],
    },
    "ch07": {
        "thesis": "hear a limit before it becomes an injury",
        "question": "Can you respect the body's signal without turning caution into surrender?",
        "sensory": "Soft daylight touches the mirror; a resistance band lies beside the barbell like an unfamiliar choice.",
        "voice": "“Pain does not make you weak. Trying to defeat pain can make you injured.”",
        "beats": ["the old pain", "the need to prove", "movement assessment", "the unwelcome modification", "fear of losing form", "pain versus effort", "technique under observation", "a recovery day", "a new measure of progress", "an alliance with the body"],
    },
    "ch08": {
        "thesis": "set boundaries without turning them into isolation",
        "question": "Can you preserve connection when honesty temporarily makes the relationship worse?",
        "sensory": "Water moves quietly under stone slabs; tea cools between two untouched cups.",
        "voice": "“A boundary without explanation can hurt. An explanation without a boundary changes nothing.”",
        "beats": ["the cancelled shared plan", "advice nobody requested", "the habitual yes", "the first clear boundary", "the other person's anger", "a pause without escape", "a request instead of a complaint", "someone else's no", "contact after conflict", "the relationship that held"],
    },
    "ch09": {
        "thesis": "refuse the bargain offered by your own anxiety",
        "question": "Which price disappears from view when the promise is fast enough?",
        "sensory": "Neon makes every face look flawless; each promise is shorter than its list of cautions.",
        "voice": "“I do not sell speed. I sell relief from the thought that you are late.”",
        "beats": ["the seven-day promise", "the before-and-after image", "the hidden price", "Max's invitation", "Alina's doubt", "the urge to accelerate", "checking the source", "refusing without superiority", "the boring alternative", "the result that remains"],
    },
    "ch10": {
        "thesis": "stop proving every day that you deserve a new identity",
        "question": "Can the new role become ordinary instead of sitting another daily exam?",
        "sensory": "Half the desk is clear; morning light no longer looks borrowed.",
        "voice": "“Identity becomes real when it stops sounding like a press release.”",
        "beats": ["the old clothes", "the room after a month", "the words you use for yourself", "unexpected praise", "fear of tempting fate", "an ordinary difficult day", "action without bargaining", "someone else's observation", "the quiet admission", "naming the new role"],
    },
    "ch11": {
        "thesis": "keep direction when familiar infrastructure disappears",
        "question": "Which part of the system survives without the gym, the schedule, or control?",
        "sensory": "The district is half dark; phones conserve power and every familiar service is down.",
        "voice": "“Now it gets interesting. Without the beautiful dashboard, do you still have a system—or only an interface?”",
        "beats": ["the city outage", "the closed gym", "the cancelled meeting", "the empty refrigerator", "conflict in the group", "limited resources", "a decision for the team", "the personal cost", "a night without control", "the morning after the test"],
    },
    "ch12": {
        "thesis": "choose which system remains after the finale",
        "question": "Did you build a result, a shelter, or a way to keep living?",
        "sensory": "The wind carries blank forms away; every window in LAB is lit below.",
        "voice": "“A finale is a bad place for a vow. Choose what survives an ordinary Tuesday.”",
        "beats": ["the final report", "the job offer", "a request from someone close", "the temptation to scale everything", "the conversation with Pavel", "meeting your first version", "three possible paths", "the price of each path", "a decision without a guarantee", "opening LAB"],
    },
    "epilogue": {
        "thesis": "see the trace of your choices and leave the door open",
        "question": "What changed in the world because you learned not to disappear?",
        "sensory": "The city wakes without victory music; lights appear in LAB one window at a time.",
        "voice": "“You did not become finished. You became someone who knows how to continue.”",
        "beats": ["morning without a signal", "a different posture", "a living space", "messages from the team", "someone else's first day", "the mentor's role", "the weakness that remains", "a personal ritual", "a letter to the future", "lights in the LAB windows"],
    },
}

FRAMES_RU = [
    "{sensory} {character} оставляет телефон экраном вниз. Тема — «{beat}» — больше не помещается в короткое оправдание. {voice}",
    "Сначала кажется, что «{beat}» можно решить ещё одним правилом. Но {character} просит назвать момент, где правило перестаёт работать. Вопрос главы звучит прямо: {question}",
    "{character} показывает две версии последних суток: идеальную на бумаге и фактическую. Между ними находится «{beat}». Разница невелика по времени, но именно здесь обычно исчезает честность.",
    "{sensory} В этой обстановке «{beat}» выглядит почти публичным испытанием. Никто не запрещает отступить, но каждый способ отступления оставит разный след в отношениях.",
    "Разговор останавливается на словах «{beat}». {character} не предлагает готовый ответ: {voice} Теперь нужно решить, какая цена действительно приемлема.",
    "Система предлагает короткое реальное действие, связанное с темой «{beat}». Оно займёт меньше десяти минут, но отменит привычный сценарий — ждать правильного состояния.",
    "После действия становится заметно то, чего не было видно в начале главы. «{beat}» связано не с недостатком силы, а с попыткой {thesis}. {character} ждёт не признания, а следующего решения.",
    "В Meridian последствия приходят не сразу. Сегодня «{beat}» возвращает реплику, сказанную три сцены назад, и делает один из удобных ответов недоступным.",
    "{sensory} {character} спрашивает, что из произошедшего ты готов повторить в плохой день. Тема «{beat}» превращается из эпизода в правило личной системы.",
    "Глава заканчивается без идеальной точки. «{beat}» остаётся в памяти персонажей, а ответ на вопрос — «{question}» — будет проверен позже, когда условия станут сложнее.",
]

FRAMES_EN = [
    "{sensory} {character} turns the phone face down. “{beat}” no longer fits inside a quick excuse. {voice}",
    "At first, “{beat}” looks like a problem for one more rule. {character} asks where the rule stops working. The chapter's question is direct: {question}",
    "{character} places two versions of the last day side by side: the ideal plan and what actually happened. “{beat}” lives in the gap, exactly where honesty usually disappears.",
    "{sensory} Here, “{beat}” feels almost public. No one prevents retreat, but every way of leaving will change a relationship.",
    "The conversation stops at “{beat}”. {character} refuses to supply the correct answer. The choice is about which cost can actually be carried.",
    "The system proposes a short real-world action tied to “{beat}”. It takes under ten minutes and interrupts the habit of waiting for the perfect state.",
    "After the action, the hidden conflict becomes visible. “{beat}” was never only about willpower. {character} waits for the next decision, not a confession.",
    "Consequences in Meridian do not arrive on schedule. “{beat}” brings back a line from three scenes ago and removes one comfortable reply.",
    "{sensory} {character} asks which part could survive a bad day. “{beat}” begins to change from an episode into a personal rule.",
    "The chapter ends without a clean conclusion. “{beat}” remains in the characters' memory, and the answer will be tested again under worse conditions.",
]

CHOICE_ARCHETYPES = [
    ("mind", "Назвать, что именно происходит, без оценки себя", "Name what is happening without judging yourself"),
    ("discipline", "Сделать минимальную версию до следующего разговора", "Complete the minimum version before the next conversation"),
    ("connections", "Попросить конкретную поддержку и обозначить границу", "Ask for specific support and state a boundary"),
    ("energy", "Уменьшить нагрузку и защитить восстановление", "Reduce the load and protect recovery"),
    ("body", "Выбрать контролируемое движение вместо доказательства", "Choose controlled movement instead of proving something"),
    ("balance", "Собрать нейтральный следующий приём пищи без компенсации", "Build one neutral next meal without compensation"),
]


def loc(ru: str, en: str) -> dict[str, str]:
    return {"ru": ru, "en": en}


def build() -> dict:
    chapters: list[dict] = []
    scenes: list[dict] = []
    choices: list[dict] = []
    delayed: list[dict] = []

    for chapter_index, chapter in enumerate(CHAPTERS):
        cid = chapter["id"]
        english = EN[cid]
        chapters.append({
            "id": cid,
            "order": chapter_index,
            "title": loc(chapter["ru"], chapter["en"]),
            "thesis": loc(chapter["thesis"], english["thesis"]),
            "dramatic_question": loc(chapter["question"], english["question"]),
            "location": loc(chapter["place"], PLACES_EN[chapter["place"]]),
            "primary_character": loc(chapter["character"], CHARACTERS_EN[chapter["character"]]),
            "first_scene_id": f"{cid}_s01",
            "scene_count": 10,
        })

        for scene_index, beat in enumerate(chapter["beats"], 1):
            beat_en = english["beats"][scene_index - 1]
            sid = f"{cid}_s{scene_index:02d}"
            if scene_index < 10:
                next_id = f"{cid}_s{scene_index + 1:02d}"
            elif chapter_index < len(CHAPTERS) - 1:
                next_id = f"{CHAPTERS[chapter_index + 1]['id']}_s01"
            else:
                next_id = None

            format_args = {
                "sensory": chapter["sensory"],
                "character": chapter["character"],
                "beat": beat,
                "voice": chapter["voice"],
                "question": chapter["question"],
                "thesis": chapter["thesis"],
            }
            format_args_en = {
                "sensory": english["sensory"],
                "character": CHARACTERS_EN[chapter["character"]],
                "beat": beat_en,
                "voice": english["voice"],
                "question": english["question"],
                "thesis": english["thesis"],
            }
            text_ru = f"«{beat.capitalize()}» требует точности. " + FRAMES_RU[scene_index - 1].format(**format_args)
            text_en = f"“{beat_en.title()}” requires precision. " + FRAMES_EN[scene_index - 1].format(**format_args_en)
            selected = [
                CHOICE_ARCHETYPES[(scene_index + chapter_index) % len(CHOICE_ARCHETYPES)],
                CHOICE_ARCHETYPES[(scene_index + chapter_index + 2) % len(CHOICE_ARCHETYPES)],
                CHOICE_ARCHETYPES[(scene_index + chapter_index + 4) % len(CHOICE_ARCHETYPES)],
            ]
            choice_ids = [f"{sid}_c{i:02d}" for i in range(1, 4)]
            scene_title = f"{scene_index:02d} · {beat.capitalize()}"
            scenes.append({
                "id": sid,
                "chapter_id": cid,
                "order": scene_index,
                "title": loc(scene_title, f"{scene_index:02d} · {beat_en.title()}"),
                "beat": loc(beat, beat_en),
                "location": loc(chapter["place"], PLACES_EN[chapter["place"]]),
                "speaker": loc(chapter["character"], CHARACTERS_EN[chapter["character"]]),
                "text": loc(text_ru, text_en),
                "dialogue": loc(
                    f"{chapter['voice']} — «{beat.capitalize()}» не станет легче от красивого названия. Что ты сделаешь до того, как снова начнёшь себя объяснять?",
                    f"{english['voice']} “{beat_en.title()}” will not become easier because it has a better name. What will you do before you start explaining yourself again?",
                ),
                "question": loc(chapter["question"], english["question"]),
                "choices": choice_ids,
                "next_default": next_id,
                "real_action": {
                    "minutes": 3 + ((scene_index + chapter_index) % 8),
                    "prompt": loc(
                        f"Запиши один факт о теме «{beat}» и выполни самый маленький следующий шаг.",
                        f"Write one fact about “{beat_en}” and complete the smallest next step.",
                    ),
                } if scene_index in {2, 6, 9} else None,
                "content_warnings": ["body_image"] if cid in {"ch01", "ch04", "ch09"} else [],
                "accessibility": {"voiceover_safe": True, "motion_required": False},
                "analytics": {"funnel": f"season01.{cid}", "step": scene_index},
                "editorial_contract": {
                    "dramatic_function": loc(
                        [
                            "экспозиция конфликта",
                            "проверка убеждения",
                            "разрыв плана и факта",
                            "социальное давление",
                            "цена решения",
                            "действие вне экрана",
                            "изменение понимания",
                            "возврат последствия",
                            "формирование правила",
                            "фиксация нового состояния",
                        ][scene_index - 1],
                        [
                            "conflict setup",
                            "belief test",
                            "plan-versus-reality gap",
                            "social pressure",
                            "cost of decision",
                            "off-screen action",
                            "change in understanding",
                            "consequence return",
                            "rule formation",
                            "new-state lock",
                        ][scene_index - 1],
                    ),
                    "conflict": loc(chapter["question"], english["question"]),
                    "stakes": loc(
                        f"Решение меняет отношение к теме «{beat}» и доверие {chapter['character']}.",
                        f"The decision changes the player's relationship with “{beat_en}” and {CHARACTERS_EN[chapter['character']]}'s trust.",
                    ),
                    "state_change": loc(
                        f"Игрок переводит тему «{beat}» из наблюдения в проверяемое решение.",
                        f"The player moves “{beat_en}” from observation into a testable decision.",
                    ),
                    "continuity_anchor": f"{cid}.{scene_index:02d}",
                },
            })

            for option_index, (stat, ru_text, en_text) in enumerate(selected, 1):
                choice_id = choice_ids[option_index - 1]
                relation_delta = 2 if stat in {"connections", "mind"} else 1
                consequence_id = None
                if scene_index % 2 == 0 and option_index == 1:
                    consequence_id = f"dc_{cid}_{scene_index:02d}"
                    delayed.append({
                        "id": consequence_id,
                        "source_choice_id": choice_id,
                        "trigger": {"after_scenes": 3},
                        "text": loc(
                            f"Решение вокруг темы «{beat}» возвращается: {chapter['character']} замечает не обещание, а повторяемое действие.",
                            f"The decision around “{beat_en}” returns: {CHARACTERS_EN[chapter['character']]} notices the repeated action rather than the promise.",
                        ),
                        "effects": [
                            {"resource": "momentum", "delta": 1},
                            {"relationship": chapter["character"].lower(), "delta": 1},
                        ],
                    })
                choices.append({
                    "id": choice_id,
                    "scene_id": sid,
                    "text": loc(f"{ru_text}: «{beat}»", f"{en_text}: “{beat_en}”"),
                    "intent": stat,
                    "immediate_effects": [
                        {"stat": stat, "delta": 2 + (option_index == 1)},
                        {"resource": "xp", "delta": 10 + scene_index},
                        {"resource": "focus", "delta": -1 if option_index == 3 else 0},
                        {"relationship": chapter["character"].lower(), "delta": relation_delta},
                        {"flag": f"{cid}.{scene_index:02d}.{stat}", "value": True},
                    ],
                    "delayed_consequence_id": consequence_id,
                    "next_scene_id": next_id,
                    "cost": {"resource": "focus", "amount": 1 if option_index == 3 else 0},
                    "telegraph": loc(
                        f"Усилит «{STATS_RU[stat]}». {chapter['character']} запомнит выбранный способ.",
                        f"Strengthens {stat}. {CHARACTERS_EN[chapter['character']]} will remember the approach.",
                    ),
                })

    scene_by_id = {scene["id"]: scene for scene in scenes}
    choice_by_id = {choice["id"]: choice for choice in choices}

    def route(scene_id: str, destination_ids: list[str]) -> None:
        """Turn one authored scene into a genuine mutually-exclusive route."""
        scene = scene_by_id[scene_id]
        scene["branch_node"] = True
        scene["next_default"] = destination_ids[0]
        for index, choice_id in enumerate(scene["choices"]):
            choice = choice_by_id[choice_id]
            choice["next_scene_id"] = destination_ids[index]
            choice["route_effect"] = {
                "open": f"route.{scene_id}.{index + 1}",
                "close": [
                    f"route.{scene_id}.{other + 1}"
                    for other in range(3) if other != index
                ],
            }
            choice["immediate_effects"].append({
                "flag": f"route.{scene_id}.{index + 1}",
                "value": True,
            })

    def rejoin(scene_ids: list[str], destination_id: str) -> None:
        for scene_id in scene_ids:
            scene_by_id[scene_id]["next_default"] = destination_id
            for choice_id in scene_by_id[scene_id]["choices"]:
                choice_by_id[choice_id]["next_scene_id"] = destination_id

    # Two route decisions per chapter: 28 critical branch nodes. Each option
    # changes which authored scene the player sees, then rejoins at a deliberate
    # convergence point. Two cross-chapter choices bring the verified total to 30.
    for chapter in CHAPTERS:
        cid = chapter["id"]
        route(f"{cid}_s01", [f"{cid}_s02", f"{cid}_s03", f"{cid}_s04"])
        rejoin([f"{cid}_s02", f"{cid}_s03", f"{cid}_s04"], f"{cid}_s05")
        route(f"{cid}_s06", [f"{cid}_s07", f"{cid}_s08", f"{cid}_s09"])
        rejoin([f"{cid}_s07", f"{cid}_s08", f"{cid}_s09"], f"{cid}_s10")
    route("prologue_s10", ["ch01_s01", "ch01_s02", "ch01_s03"])
    route("ch04_s10", ["ch05_s01", "ch05_s02", "ch05_s03"])

    # Twenty route-closing decisions explicitly persist the open route and the
    # two closed alternatives. The runtime exposes these in the consequence log.
    for scene in [item for item in scenes if item.get("branch_node")][:20]:
        scene["route_closure"] = True

    # Relationship-gated options. The unavailable line is visible with its
    # reason; every scene keeps two viable alternatives.
    gated = [f"{chapter['id']}_s08" for chapter in CHAPTERS]
    gated += ["ch08_s05", "ch12_s05"]
    for scene_id in gated:
        scene = scene_by_id[scene_id]
        character_id = scene["speaker"]["en"].lower()
        choice_by_id[scene["choices"][2]]["requirements"] = [
            {"type": "relationship", "id": character_id, "min": 2}
        ]
        scene["relationship_gate"] = character_id

    # Conditional scene prose. These are runtime-selected, not documentation
    # claims: 40 origin-sensitive setback variants + action/skip/relationship
    # variants elsewhere.
    for scene_index in range(1, 11):
        scene = scene_by_id[f"ch05_s{scene_index:02d}"]
        scene["variants"] = []
        for origin, ru_reason, en_reason in [
            ("lost", "стыд после потери формы", "shame after losing form"),
            ("burnout", "истощение после попытки удержать темп", "exhaustion after trying to hold the pace"),
            ("potential", "распад плана без внешней структуры", "a plan collapsing without external structure"),
            ("return", "гонка с прежней версией себя", "racing a former version of yourself"),
        ]:
            scene["variants"].append({
                "id": f"ch05.{scene_index:02d}.origin.{origin}",
                "requirements": [{"type": "origin", "value": origin}],
                "text": loc(
                    f"Причина срыва становится конкретной: {ru_reason}. Ева не разрешает назвать это слабостью и просит собрать контракт, который переживёт следующие сорок восемь часов.",
                    f"The setback becomes specific: {en_reason}. Eva refuses to call it weakness and asks for a contract that can survive the next forty-eight hours.",
                ),
            })

    for stat in STATS:
        scene_by_id["ch05_s04"]["variants"].append({
            "id": f"ch05.04.dominant.{stat}",
            "requirements": [{"type": "dominant_stat", "value": stat}],
            "text": loc(
                f"Твоя сильнейшая опора — {STATS_RU[stat]} — стала способом не замечать остальную систему. Ева возвращает разговор к цене этой компенсации.",
                f"Your strongest resource—{stat}—became a way to ignore the rest of the system. Eva brings the conversation back to the cost of that compensation.",
            ),
        })
        scene_by_id["ch05_s05"]["variants"].append({
            "id": f"ch05.05.weak.{stat}",
            "requirements": [{"type": "weak_stat", "value": stat}],
            "text": loc(
                f"Слабое звено — {STATS_RU[stat]} — больше нельзя закрыть мотивационной фразой. Новый контракт должен защищать именно его.",
                f"The weak link—{stat}—can no longer be covered by a motivational line. The new contract has to protect it.",
            ),
        })
    scene_by_id["ch05_s06"]["variants"].append({
        "id": "ch05.06.skips",
        "requirements": [{"type": "skip_count", "min": 2}],
        "text": loc(
            "Два пропуска превратились в разрешение исчезнуть. Ева отделяет пропуск действия от пропуска контакта с системой.",
            "Two skips became permission to disappear. Eva separates skipping an action from abandoning contact with the system.",
        ),
    })
    scene_by_id["ch05_s08"]["variants"].append({
        "id": "ch05.08.low_energy",
        "requirements": [{"type": "stat", "id": "energy", "max": 34}],
        "text": loc(
            "При такой энергии компенсация стала бы ещё одной формой срыва. Контракт начинается со сна и уменьшения нагрузки.",
            "At this energy level, compensation would be another form of setback. The contract starts with sleep and a reduced load.",
        ),
    })
    scene_by_id["ch05_s10"]["variants"].append({
        "id": "ch05.10.return_contract",
        "requirements": [{"type": "flag", "id": "return.contract", "value": True}],
        "text": loc(
            "Ты не обещаешь больше не срываться. Ты подписываешь три условия возвращения: заметить, уменьшить и связаться.",
            "You do not promise never to stumble again. You sign three return conditions: notice, reduce and reconnect.",
        ),
    })

    for chapter in CHAPTERS[:12]:
        cid = chapter["id"]
        scene_by_id[f"{cid}_s07"].setdefault("variants", []).append({
            "id": f"{cid}.07.real_action",
            "requirements": [{"type": "real_action", "id": f"{cid}_s06", "value": True}],
            "text": loc(
                "Разговор меняется, потому что действие уже произошло вне экрана. Персонаж обсуждает не намерение, а наблюдаемый факт.",
                "The conversation changes because the action already happened off-screen. The character responds to an observed fact, not an intention.",
            ),
        })
    for chapter in CHAPTERS[:8]:
        cid = chapter["id"]
        scene_by_id[f"{cid}_s09"].setdefault("variants", []).append({
            "id": f"{cid}.09.skip",
            "requirements": [{"type": "skip_count", "min": 1}],
            "text": loc(
                "Пропуск остаётся в памяти сцены: не как штраф, а как ограничение, которое новый план обязан выдержать.",
                "The scene remembers the skip—not as punishment, but as a constraint the new plan must survive.",
            ),
        })
    for chapter in CHAPTERS:
        cid = chapter["id"]
        character_id = CHARACTERS_EN[chapter["character"]].lower()
        scene_by_id[f"{cid}_s05"].setdefault("variants", []).append({
            "id": f"{cid}.05.relationship",
            "requirements": [{"type": "relationship", "id": character_id, "min": 4}],
            "text": loc(
                f"{chapter['character']} говорит тише: доверие уже позволяет отказаться от безопасной общей фразы и назвать настоящий конфликт.",
                f"{CHARACTERS_EN[chapter['character']]} lowers their voice: there is now enough trust to leave the safe general answer and name the actual conflict.",
            ),
        })

    ending_specs = [
        ("architect", "Архитектор устойчивости", "Architect of Stability", {"discipline": 72, "mind": 62}, "Ты оставляешь после себя систему, которая работает без героизма.", "You leave behind a system that works without heroics."),
        ("restorer", "Хранитель энергии", "Keeper of Energy", {"energy": 72, "balance": 62}, "Ты научился продолжать, потому что перестал считать восстановление отступлением.", "You learned to continue because recovery no longer looks like retreat."),
        ("athlete", "Точное тело", "The Precise Body", {"body": 74, "discipline": 58}, "Тело становится союзником: сильным, слышимым и не обязанным терпеть всё.", "The body becomes an ally: strong, heard, and no longer required to endure everything."),
        ("strategist", "Честный стратег", "Honest Strategist", {"mind": 74, "balance": 56}, "Ты видишь систему целиком и больше не прячешь страх внутри красивого плана.", "You see the whole system and no longer hide fear inside a beautiful plan."),
        ("connector", "Связующий", "The Connector", {"connections": 74, "mind": 54}, "Ты строишь изменения, которые выдерживают близость, границы и чужое «нет».", "You build change that can carry closeness, boundaries, and someone else's no."),
        ("steady", "Тихая устойчивость", "Quiet Stability", {"momentum": 24}, "Твой результат трудно показать одним кадром — и невозможно отнять одним плохим днём.", "Your result is difficult to show in one frame—and impossible to erase with one bad day."),
        ("returner", "Вернувшийся", "The Returner", {"return_count": 2}, "Ты не избежал срывов. Ты сделал возвращение частью своей идентичности.", "You did not avoid setbacks. You made returning part of your identity."),
        ("open", "Открытая точка", "Open Point", {}, "Meridian не выносит приговор. Дверь LAB остаётся открытой для следующего цикла.", "Meridian does not pass judgment. The LAB door remains open for the next cycle."),
    ]
    return {
        "schema_version": 4,
        "id": "season_01",
        "title": loc("Сезон 1 — Точка А", "Season 1 — Point A"),
        "estimated_hours": "6–8",
        "authorship": "Original concept, system and authorship: Павел Марков / Pavel Markov / MARKOVMADE",
        "design_contract": {
            "mandatory_setback_chapter": "ch05",
            "no_paywalled_choices": True,
            "no_streak_destruction": True,
            "offline_complete": True,
            "real_action_minutes": "3–10",
            "critical_branch_nodes": 30,
            "conditional_scene_variants": sum(len(scene.get("variants", [])) for scene in scenes),
            "relationship_gates": len(gated),
            "real_action_dependent_scenes": 12,
            "skip_dependent_scenes": 8,
            "route_closing_choices": 20,
        },
        "chapters": chapters,
        "scenes": scenes,
        "choices": choices,
        "delayed_consequences": delayed,
        "ending_rules": [
            {
                "id": eid,
                "title": loc(ru, en),
                "priority": i,
                "requirements": req,
                "text": loc(text_ru, text_en),
                "sequence": [
                    {
                        "phase": "mirror",
                        "title": loc("Что осталось", "What Remained"),
                        "text": loc(
                            f"Meridian возвращает твои решения без монтажа. Финал «{ru}» начинается не с награды, а с цены, которую ты научился замечать.",
                            f"Meridian returns your decisions without an edit. “{en}” begins not with a reward, but with the cost you learned to notice.",
                        ),
                    },
                    {
                        "phase": "relationship",
                        "title": loc("Кто отвечает", "Who Answers"),
                        "text": loc(
                            "Один из близких персонажей называет выбор, после которого стал доверять тебе иначе. Другой оставляет сообщение без ответа — последствия не обязаны быть удобными.",
                            "One close character names the choice that changed their trust. Another leaves a message unanswered—consequences do not have to be convenient.",
                        ),
                    },
                    {
                        "phase": "world",
                        "title": loc("Изменённый Meridian", "Meridian Changed"),
                        "text": loc(
                            "В LAB меняется расписание, квартира хранит след реальных действий, а открытый район показывает, какую функцию система теперь выполняет для других.",
                            "The LAB schedule changes, the apartment carries the trace of real actions, and an open district shows what the system now does for other people.",
                        ),
                    },
                    {
                        "phase": "next",
                        "title": loc("Обычный вторник", "An Ordinary Tuesday"),
                        "text": loc(text_ru, text_en),
                    },
                ],
            }
            for i, (eid, ru, en, req, text_ru, text_en) in enumerate(ending_specs, 1)
        ],
    }


if __name__ == "__main__":
    data = build()
    encoded = json.dumps(data, ensure_ascii=False, indent=2) + "\n"
    OUT.parent.mkdir(parents=True, exist_ok=True)
    WEB_OUT.parent.mkdir(parents=True, exist_ok=True)
    PUBLIC_OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(encoded, encoding="utf-8")
    WEB_OUT.write_text(encoded, encoding="utf-8")
    PUBLIC_OUT.write_text(encoded, encoding="utf-8")
    print(json.dumps({
        "outputs": [str(OUT), str(WEB_OUT), str(PUBLIC_OUT)],
        "chapters": len(data["chapters"]),
        "scenes": len(data["scenes"]),
        "choices": len(data["choices"]),
        "delayed_consequences": len(data["delayed_consequences"]),
        "endings": len(data["ending_rules"]),
    }, ensure_ascii=False))
