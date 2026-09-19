# Viora Skills → v-next: пак улучшений и промпт для Fable 5.1

Разбор трёх скиллов из `viora-skills-main.zip` (`viora-aegis` 2.0.0, `viora-code-protocol` v2.1, `viora-design-skills` 4.1.0), поиск лучших чужих скиллов на GitHub и готовый промпт для исполнения в три сессии на Fable 5.1 в рамках бюджета $100.

Исходное состояние проверено локально: `viora-aegis` `scan --quiet` → exit 0; `viora-code-protocol` `tests/run-all.sh` → 85/85; `viora-design-skills` `selftest.mjs` и `docsync.mjs` → зелёные. Промпт ниже опирается на эти команды как на приёмку.

---

## 1. Что у тебя уже сильно (и чего не трогаем)

| Скилл | Уникальное ядро | Не ломать |
|---|---|---|
| **aegis** | «регексп — зацепка, не находка»; 6 ворот опровержения; режим SKILL-AUDIT с тирами auto-run / on-invocation; `plan <mode>` как литеральная процедура для слабых моделей | Ten Laws, форму находки, SARIF, baseline |
| **code-protocol** | дирижёр `viora.py` с fingerprint-доказательствами (STALE-арифметика), тиры T0/T1/T2, 85 тестов на сам протокол, 6 eval-фикстур | конвейер из 10 шагов, отчётный контракт, `.viora/` как единственный источник правды |
| **design-skills** | 8 ворот G0–G7, 14 миров, две полосы FULL/LITE, `lane.mjs` решает полосу без самооценки модели, 66 + 36 механических правил, кириллический пул шрифтов | десять законов, «execute, never read» для data/ и scripts/ |

Общий пробел всех трёх: они не знают моделей 2026 года (`lane.mjs` и `07-model-tiers.md` заканчиваются на gpt-5.1 / gemini-3 / «Flash»), у aegis нет ни evals, ни tests (у двух других есть), а `.viora/` как единое состояние есть только у code-protocol.

---

## 2. Что нашёл на GitHub и что из этого брать

Просмотрено ~20 репозиториев, склонировано и прочитано 12. Ниже только то, что даёт новое качество, а не дубли уже поглощённых (addyosmani, mattpocock, superpowers, ToB differential/variant, ui-ux-pro-max, frontend-design, WIG, web-quality).

| Репо | ★ | Лицензия | Что там хорошего | Куда в Viora |
|---|---|---|---|---|
| **cloudflare/security-audit-skill** | 16K | MIT | **Coverage ledger**: аудит = детерминированный список единиц (entry surface × trust boundary × subsystem × attack class) со статусами; «Not assessed» выводится из леджера, а не из памяти. Три терминальных состояния находки `confirmed / needs_validation / rejected`, у `needs_validation` нет severity. Отдельный чистый верификатор на каждого кандидата. JSON-схема находок, отчёт генерируется из JSON → проза и JSON не расходятся. Список из 10 анти-паттернов аудита | aegis: A5, A8, A13 |
| **trailofbits/skills** (новые: post-patch-validation, fp-check, sharp-edges, spec-to-code-compliance) | 7K | **CC BY-SA 4.0** — только идеи, своими словами, с атрибуцией | **post-patch-validation**: контракт доказательства фикса — проверка обязана падать на base и проходить на patched, маркер `REACHED` в stdout (иначе упавший импорт выглядит как «уязвимость воспроизведена»), side-blind запуск. **sharp-edges**: 6 классов footgun-API (bool-флаги безопасности, `lifetime=0` = бесконечно, string-типизированные роли, тихие return-value). **spec-to-code**: код vs документ: holds / contradicts / absent / undocumented | aegis: A9, A10, A11 |
| **NVIDIA/SkillSpector** | 18K | Apache-2.0 | 71 паттерн в 17 категориях для аудита скиллов. У тебя 42 правила в 9 категориях. Нет: anti-refusal, trigger abuse (описание «включай меня всегда»), memory poisoning (запись в CLAUDE.md/AGENTS.md хоста), system-prompt leakage, MCP tool poisoning, tool shadowing, agent snooping (чтение `~/.cursor`, `~/.codex`, `.aws`), unicode confusables. Risk score 0–100 | aegis: A2, A3 |
| **snyk/agent-scan** | 3K | Apache-2.0 | **Toxic flow**: триада «читает недоверенный контент ∧ имеет доступ к секретам ∧ может отправить наружу» = exfil-путь, даже если каждая часть по отдельности Low. Инвентаризация всех установленных скиллов/MCP по известным путям всех агентов | aegis: A2 (SA-FLOW), A4 |
| **Nutlope/hallmark** | 29K | MIT | **«Структурная одинаковость — отпечаток ИИ, а не визуальная»**: hero → 3 карточки → CTA → футер. 21 именованная макроструктура страницы, 6 структурных осей, 14 архетипов навигации, 8 футеров, «default away from N1a/Ft3». **Диверсификация через память проекта** (`log.json`): два подряд выхода обязаны различаться макроструктурой и минимум одной из трёх осей темы. **Component-scope**: preview-файл с 8 состояниями через `.is-hover/.is-focus`. Verb `study`: извлечь ДНК из скриншота/URL, не копируя пиксели | design: C2, C3, C7, C10 |
| **pbakaus/impeccable** | 69K | Apache-2.0 | Словарь глаголов (harden, quieter/bolder, critique, distill, typeset…). `PRODUCT.md` = правда о продукте отдельно от `DESIGN.md` = мир. Craft-floor запреты, которых у тебя нет в линтере: offset-тень `4px 4px 0` вне необрутализма, mono как «костюм технологичности», `feTurbulence`-зерно, `repeating-linear-gradient`-полосы, ghost-card (1px border + широкая мягкая тень), tracking ниже −0.04em, системный display-шрифт, юникод-глифы вместо иконок. Правило «refinement preserves; redesign replaces; never split the difference» | design: C4, C8, C9 |
| **ibelick/ui-skills** | 9K | MIT | Мелкие механические правила, которых нет в `wig.mjs`: `inert` на скрытых оверлеях, `inputmode`/`enterkeyhint`, `scroll-margin-top` под sticky-шапкой, россыпь `will-change`, `text-wrap: balance` на заголовках | design: C4 |
| **alchaincyf/huashu-design** | 24K | MIT | «Gate-файл протокол»: каждый чекпоинт материализуется в файл, никакой разрешающий тон не освобождает. У design-skills нет дирижёра — маркеры ворот печатаются текстом и ничего не проверяют | design: C1 |
| **wsbm393/Fable-Skill** (executing-hard-tasks) | 26 | MIT | Написан под Fable. **Три корзины** отчёта: Verified (вывод вставлен) / Believed (любой модальный глагол внутри «работает» автоматически сюда) / Not checked. **DECISION-строки** для выборов, меняющих данные или видимое поведение. Тончайший срез через самую рискованную интеграцию в первой четверти бюджета. **Сюрприз** = вывод чекпоинта отличается от записанного ожидания → перепланирование обязательно. «Никогда не утверждай факт окружения без `which`» | code-protocol: B1–B4 |
| **DietrichGebert/ponytail** | 142K | MIT | «Ленивый сеньор»: ранжированный список «удалить / упростить / заменить stdlib или платформой». Таблица зависимостей, заменяемых нативно | code-protocol: B7 |
| **anthropics/skills → skill-creator**, **obra/superpowers → writing-skills** | 177K / 289K | ideas only / MIT | Trigger-evals: 20 запросов should/should-not с близкими промахами; description = только условия срабатывания, без пересказа процесса (SDO). Description у code-protocol сейчас пересказывает тиры — это мешает роутингу | все три: A7, B5/B6, C6 |
| **ECC context-budget**, **planning-with-files** | 263K / 27K | ideas only | Оценка токенов загруженных правил; «resume from disk» одной командой | code-protocol: B9, B10 |

Сознательно **не** беру: Claude-Red / RAPTOR (offense, противоречит закону «defence only»), 817-skill сборники (шум), «давать варианты вместо решения» из huashu (противоречит закону Commit), live-browser бинарь impeccable (зависимость), caveman как стиль (но идею экономии беру в правила промпта).

---

## 3. Пак улучшений по каждому скиллу

Приоритеты: **P0** — делает скилл заметно сильнее и дёшево; **P1** — уникальность; **P2** — если остались деньги.

### 3.1 viora-aegis → 2.1.0

| # | Улучшение | Источник | Файлы | Что изменится | Пр. |
|---|---|---|---|---|---|
| A1 | **tests + evals** для сканера: 6 фикстур (true SQLi, параметризованный SQLi, секрет в тесте, `pull_request_target`, вредоносный SKILL.md, fail-open auth) и `tests/run-all.sh` с ~30 утверждениями | по образцу твоего же code-protocol | `tests/`, `evals/fixtures/` | aegis становится измеримым; регрессии правил ловятся до релиза | P0 |
| A2 | **+12 правил SKILL-AUDIT**: `SA-TRIG-*` (over-broad description, «замени встроенный инструмент»), `SA-REF-*` anti-refusal, `SA-MEM-*` запись в CLAUDE.md/AGENTS.md/память хоста, `SA-MCP-*` tool poisoning / tool shadowing / `*`-права, `SA-SNOOP-*` чтение конфигов других агентов, `SA-OBF-004` confusables, `SA-LEAK-001` запрос системного промпта, `SA-FLOW-001` токсичная триада (вычисляется в коде, не регексп). Тир auto-run расширен на `.claude/settings.json` hooks, `.cursor/mcp.json`, `.codex/config.toml`, `.gemini/settings.json`, `.mcp.json`, `postinstall` | SkillSpector, snyk | `rules/skill-audit.json`, `scripts/viora_skillaudit.py`, `references/10-skill-audit.md` | SKILL-AUDIT догоняет NVIDIA по категориям, оставаясь оффлайн и zero-deps | P0 |
| A3 | Risk score 0–100 рядом с уже существующим `MACHINE PRE-VERDICT` в skill-audit (сейчас есть вердикт, но нет числа для сравнения двух скиллов); «счёт — зацепка, тир — вердикт» | SkillSpector | `viora_skillaudit.py`, `templates/SKILL_AUDIT_REPORT.md` | сравнимость аудитов между собой и во времени (нужно для A4 `--verify`) | P0 |
| A4 | `skill-audit --installed` (инвентаризация скиллов/MCP по путям всех агентов) + `--lock` / `--verify`: `.viora/skills.lock.json` с sha256 каждого скилла; `--verify` ловит **дрифт после установки** | snyk + своё | `viora_skillaudit.py`, playbook 05 | никто из конкурентов не проверяет, что скилл не изменился после установки | P0 |
| A5 | JSON-схема находки `rules/finding.schema.json`; `report` валидирует JSON и рендерит прозу **из него**; UNDETERMINED ≡ `needs_validation` — без severity (проверяется) | cloudflare | `scripts/viora.py`, `templates/SECURITY_REPORT.md`, SKILL.md §6 | отчёт не может противоречить данным | P0 |
| A6 | +10 правил секретов: Azure (client secret, connection string), GCP service-account JSON, Vercel, Supabase service_role, Cloudflare API token, Discord bot, HuggingFace `hf_`, Docker `dckr_pat_`, `AGE-SECRET-KEY`, Firebase | своё | `rules/secrets.json` | закрывает реальные пробелы (проверено grep'ом — их нет) | P0 |
| A7 | `ATTRIBUTION.md` (у aegis его нет), обновление роутера/версии/моделей в SKILL.md, `evals/triggers.json` (20 запросов) | skill-creator | корень, SKILL.md | лицензионная чистота + лучший роутинг | P0 |
| A8 | **Coverage ledger**: `viora.py coverage init` строит единицы из `doctor` (entry points × boundaries × категории правил); `coverage mark <id> covered\|blocked\|deferred --note`; секция «Not assessed» отчёта генерируется из леджера; `check` падает, если в AUDIT есть неразмеченные единицы | cloudflare | `scripts/viora.py`, playbook 02, SKILL.md §8 | «Not assessed» становится арифметикой, как STALE в code-protocol | P1 |
| A9 | `viora.py fixcheck --base <ref> --cmd <argv>`: гоняет проверку на base и на рабочем дереве, требует маркер `VIORA_REACHED` в stdout, пишет red-on-base/green-on-patch с fingerprint в `.viora/fixes.jsonl`; фикс без такой записи в отчёте = UNPROVEN | ToB post-patch-validation (своя реализация) | `scripts/viora.py`, playbook 03, SKILL.md §7 | закон «оставь тест, который падает без фикса» становится проверяемым | P1 |
| A10 | `references/14-sharp-edges.md` + 6 правил `DEFAULT-*` для footgun-API в собственном коде пользователя (bool-флаги безопасности, `verify=False`-подобные, `0` = бесконечно, string-роли, игнор return-value) | ToB sharp-edges | rules, references, playbook 08 | режим DEFAULTS покрывает не только конфиги, но и API, которые проект экспортирует | P1 |
| A11 | SPEC-CHECK: вторая половина режима DESIGN — после реализации сравнить таблицу контролей из THREAT_MODEL.md с кодом: holds / contradicted / absent / undocumented | ToB spec-to-code | `templates/THREAT_MODEL.md`, playbook 14 | замыкается цикл «модель угроз → контроли → проверка контролей» | P1 |
| A12 | Чеклисты data-isolation & lifecycle (мультитенантность, удаление, retention, бэкапы) и desktop / local IPC | cloudflare companions | `references/09-checklists.md` | две зоны, где сейчас пусто | P2 |
| A13 | Чистый верификатор для T2-агентов: каждого кандидата в CONFIRMED отдать свежему субагенту только с находкой и путями, без рассуждений охотника | cloudflare | playbook 04 | режет самоподтверждение | P2 |

### 3.2 viora-code-protocol → v2.2

| # | Улучшение | Источник | Файлы | Что изменится | Пр. |
|---|---|---|---|---|---|
| B1 | **Три корзины** в отчёте: VERIFIED / BELIEVED / NOT CHECKED. `report` и `check` сканируют заметки шагов и текст отчёта: модальные глаголы (should, will, likely, probably, expect, «once X») в VERIFIED-строке → автоматический перенос в BELIEVED с причиной. Сейчас в дирижёре хеджей нет вовсе (проверено), только в rubric g09 | Fable-Skill | `scripts/viora.py`, `templates/report.md`, SKILL.md §8, evals/rubric g07/g09 | «должно работать» перестаёт проходить через машину | P0 |
| B2 | `viora.py decision "X over Y because Z" [--irreversible] [--approved]` → секция DECISIONS в отчёте; `check` падает на `--irreversible` без `--approved`. В §6 правило route vs destination: меняет done-test, удаляет данные, меняет публичный интерфейс, ослабляет требование → спрашивать | Fable-Skill | `scripts/viora.py`, SKILL.md §1, §6 | скрытые выборы становятся видимыми строками | P0 |
| B3 | RED с ожиданием: `gate --expect "<substring>"` для red/repro; несовпадение → строка `SURPRISE`, `next` печатает «re-derive PLAN», `done 6` блокируется. `plan --risk`: одна строка риска на файл, самый рискованный первым | Fable-Skill | `scripts/viora.py`, SKILL.md §1 шаги 4–5, `05-tests-and-evidence.md` | сюрприз — механическое событие, а не ощущение | P0 |
| B4 | Banned excuses +2: «инструмент X недоступен» без `which`; «части верны, значит работает». `doctor` печатает `which` по инструментам стека, чтобы утверждение было подкреплено | Fable-Skill | SKILL.md §7, `14-rationalizations.md`, `scripts/viora.py` | | P0 |
| B5 | Обновить `07-model-tiers.md`: таблица 2026 (Fable 5.1 / Mythos 5.1 / Opus 5 / GPT-5.x / Gemini 3 Pro → T2; Sonnet 5 → T1; Haiku 4.5 / Flash / mini / локальные → T0); триггер демоушена «контекст > ~60 %». Description урезать до условий срабатывания (SDO). CHANGELOG v2.2 | superpowers SDO | `references/07-model-tiers.md`, SKILL.md frontmatter, CHANGELOG | правильный тир для текущих моделей, лучший роутинг | P0 |
| B6 | `evals/triggers.json` — 20 запросов should/should-not | skill-creator | `evals/` | | P0 |
| B7 | `scripts/less.py` — «ленивый сеньор»: forward-only обёртки, абстракции с одним вызовом, зависимости, заменяемые платформой (таблица ~25: lodash→native, moment→Intl/Temporal, axios→fetch, uuid→`crypto.randomUUID`, pytz→zoneinfo, mock→unittest.mock…), конфиги отсутствующих инструментов. Ранжированный список delete / simplify / replace. Вшить в шаг 7 CLEAN (T1/T2) и в `verify.sh` | ponytail | `scripts/less.py`, `references/15-less-code.md`, SKILL.md §1 | дефект Bloat получает свой сканер, как Duplication имеет `find_duplicates.py` | P1 |
| B8 | `viora.py mutate --file F --line N --test <cmd>`: во временной копии переворачивает один оператор (`==`↔`!=`, `<`↔`<=`, `and`↔`or`, `True`↔`False`, `return X`→`return None`), гоняет тест; PASS = тест слабый → RED недостаточен. Запись `mutation` в evidence. T2 FIX требует одну мутацию на исправленной строке. Zero deps, `try/finally` восстанавливает файл всегда | ToB mutation-testing (идея) | `scripts/viora.py`, `05-tests-and-evidence.md` | доказательство, что RED действительно ловит баг, а не просто зелёный | P1 |
| B9 | `viora.py resume` — один экран состояния для новой сессии (тир, режим, шаг, файлы плана, STALE-строки, открытые DECISION). Ссылка из `templates/handoff.md` | planning-with-files | `scripts/viora.py` | продолжение после обрыва контекста без чтения `.viora/*` руками | P1 |
| B10 | `doctor --context`: оценка токенов загруженных правил (AGENTS.md, CLAUDE.md, .cursor/rules, skills) с порогом и подсказкой демоушена | ECC context-budget | `scripts/viora.py` | | P2 |
| B11 | `checkpoint --worktree` для REFACTOR ≥ 100 строк | superpowers worktrees | `scripts/viora.py` | | P2 |

### 3.3 viora-design-skills → 4.2.0

| # | Улучшение | Источник | Файлы | Что изменится | Пр. |
|---|---|---|---|---|---|
| C1 | **Дирижёр ворот** `scripts/gate.mjs`: `gate.mjs pass G2 "direction: Swiss Utility"` пишет `.viora/design-run.json`; `verify.mjs` отказывается печатать вердикт, если обязательные для job ворота не пройдены; `gate.mjs status`. Маркеры ворот в SKILL.md идут через команду, не текстом. LITE: 4 записи | huashu gate-файлы + твой code-protocol | `scripts/gate.mjs`, `scripts/verify.mjs`, SKILL.md, LITE.md | все три Viora-скилла держат состояние в `.viora/` одинаково; ворота нельзя «проговорить» | P0 |
| C2 | **Структурный слой**: `reference/20-structure.md` — 6 структурных осей, меню из 16 именованных форм страницы (свои имена, порядок секций у каждой), 10 архетипов навигации, 6 футеров, список «не по умолчанию». G3 выдаёт `STRUCTURE: <shape> / nav <N> / footer <F>`; в DESIGN.md блок STRUCTURE. `check.mjs`: `template-rhythm` (hero → грид из 3 равных карточек → CTA-полоса = warning), `stock-footer` (4 колонки ссылок + соцряд) | hallmark | `reference/20-structure.md`, `reference/12-design-md.md`, `check.mjs`, `check-rules.mjs` | закрывает главный отпечаток ИИ, который сейчас ловится только визуально | P0 |
| C3 | **Память диверсификации**: `.viora/design-log.json` дописывается на G7 (мир, палитра, пара, структура, nav, footer, paper band, accent hue); `pick.mjs --avoid-last` исключает прошлые мир/палитру/структуру; `check.mjs` `repeat-world` — warning, если мир DESIGN.md совпал с последней записью для другой поверхности | hallmark | `scripts/pick.mjs`, `check.mjs`, SKILL.md G2/G7 | мягкое «Rotation rule» становится механическим | P0 |
| C4 | **+7 правил craft** в `check.mjs`: `offset-shadow`, `svg-grain` (feTurbulence), `stripe-bg`, `ghost-card` (1px border ∧ blur ≥ 20px в одном правиле), `over-tracking` (≤ −0.04em), `system-display-face`, `glyph-icon` (✓✕→★ внутри button/nav). **+5 в `wig.mjs`**: `inert` на скрытых оверлеях, `inputmode`/`enterkeyhint`, `scroll-margin-top` под sticky-шапкой, `will-change` > 3 раз, `text-wrap: balance` на h1/h2 (hint) | impeccable, ui-skills | `scripts/rules/check-rules.mjs`, `scripts/check.mjs`, `scripts/wig.mjs` | проверено grep'ом: ни одного из этих правил сейчас нет | P0 |
| C5 | `lane.mjs`: добавить claude-fable-5*, claude-mythos-5*, claude-opus-5*, claude-sonnet-5*, claude-haiku-4-5, gpt-5.x, gemini-3.x → FULL/LITE. `docsync.mjs` проверяет бейджи README против версии SKILL.md (сейчас README пишет v3.0.0 при SKILL 4.1.0). ATTRIBUTION.md +4 строки | своё | `scripts/lane.mjs`, `scripts/docsync.mjs`, `ATTRIBUTION.md` | | P0 |
| C6 | `evals/triggers.json` — 20 запросов | skill-creator | `evals/` | | P0 |
| C7 | **Component-scope**: G0 распознаёт бриф на один компонент; G2-структура пропускается; G5 генерирует `<Name>.preview.html` из `assets/blocks/html/preview-shell.html` с 8 состояниями через `.is-hover/.is-focus/.is-active/...`; `wig.mjs` `component-states`: интерактивный компонент без `:focus-visible` или `:disabled` → error | hallmark | `assets/blocks/html/preview-shell.html`, SKILL.md G0/G5, `wig.mjs` | закон 7 «каждое состояние отгружается» получает доказательство | P1 |
| C8 | Три глагола как подрежимы CHANGE в одном `reference/21-verbs.md` (≤ 120 строк): **HARDEN** (длинные строки, empty/error/loading, RTL/i18n, zoom 200 %, offline), **QUIET↔BOLD** (один регулятор: что убрать / что усилить, никогда оба), **CRITIQUE** (≤ 5 находок `file:line — проблема — правка`, без кода). Строки в роутере G0. Правило «refinement preserves; redesign replaces; never split the difference» в G0 | impeccable | `reference/21-verbs.md`, SKILL.md G0 | точечные просьбы получают точный режим вместо 8-воротной церемонии | P1 |
| C9 | `assets/PRODUCT.template.md` (аудитория, утверждения с источниками, ограничения, запрещённые заявления); G1 читает PRODUCT.md, если есть; `fake-stat` расширить: число в копирайте, которого нет в PRODUCT.md → warning | impeccable | `assets/`, SKILL.md G1, `check.mjs` | закон 6 «real substance» перестаёт зависеть от честности модели | P1 |
| C10 | Job **STUDY**: скриншот/URL → отчёт ДНК (структура, регистр типографики, цветовой якорь, плотность) → опционально DESIGN.md; «пиксели не копируем, шаблонные маркетплейсы отказ» | hallmark study | `reference/01-direction.md` (≤ 60 строк), SKILL.md G0 | референс превращается в контракт, не в копию | P1 |
| C11 | OKLCH: `palettes.mjs --oklch` с hex-фолбэком, `contrast.mjs` парсит `oklch()` | своё | scripts | | P2 |

---

## 4. Что докрутить из «большой базы» — сквозные вещи

1. **Единый `.viora/` для всех трёх скиллов.** У code-protocol это уже ядро; aegis пишет туда baseline; design получает `gate.mjs` (C1). Тогда `viora-build` (оркестратор) сможет читать одно состояние. Это и есть «уникальное»: три скилла, одна дисциплина доказательств.
2. **Fable-специфика.** Fable 5.1 — adaptive thinking, 1M контекст, дорогой output ($50/MTok), дешёвый кэш ($0.25/MTok). Скиллы должны быть cache-friendly: статичные SKILL.md первыми, динамика в конце; никаких «прочитай всё на всякий случай» (у тебя это уже правило). В тир-таблицах Fable/Mythos/Opus 5 → T2 / FULL, Sonnet 5 → T1, Haiku 4.5 → T0 / LITE.
3. **Trigger-evals везде** (A7/B6/C6). Скилл, который не срабатывает на «сделай красиво» или срабатывает на «покрась кнопку» ценой 8 ворот, — не работает, как бы хорош ни был внутри.
4. **Лицензии.** ToB — CC BY-SA: только идеи своими словами + строка в ATTRIBUTION. Apache-2.0 (NVIDIA, snyk, impeccable) — атрибуция, текст не копировать. MIT — можно, но всё равно переписывать: весь смысл Viora в согласованном голосе.
5. **Что не делать:** не расширять data/*.csv, не добавлять зависимости, не трогать 85 тестов code-protocol (только добавлять), не переписывать SKILL.md целиком — точечные патчи.

---

## 5. Бюджет: $100 на Fable 5.1

Тарифы Fable 5.1 (API, сентябрь 2026): вход $10/MTok, выход $50/MTok, чтение кэша $0.25/MTok, запись кэша $12.5/MTok. Главный расход — **output с thinking** и **некэшированный вход при раздутом контексте**.

Модель одной сессии (60 вызовов инструментов, контекст растёт 30K → 110K, средний 70K, кэш-хиты ~85 %, effort **high**):

| Статья | Токены | $ |
|---|---|---|
| вход без кэша (15 %) | 0.63M | 6.3 |
| вход из кэша (85 %) | 3.6M | 0.9 |
| запись кэша | 0.15M | 1.9 |
| output + thinking (~3.5K/ход) | 0.21M | 10.5 |
| **итого сессия** | | **≈ $20** |

Три сессии ≈ **$60**, резерв $40 на промахи кэша и переделки. Если харнес **не** кэширует (худший случай: вход 4.2M × $10 = $42 за сессию), выполнять только P0 → три сессии уложатся в ~$95. Поэтому:

- **Effort: `high`, не `Xhigh`.** На скриншоте выбран Xhigh — это лишние thinking-токены по $50/MTok на механическую работу. Xhigh не нужен ни для одного пункта плана.
- **Три отдельные сессии**, по одной на скилл, с чистым контекстом. Одна длинная сессия на все три стоила бы в 2–3 раза дороже из-за роста контекста.
- **Никакого клонирования чужих репозиториев.** Исследование уже сделано, идеи дистиллированы в промпт. Чтение чужого кода — самая дорогая статья, и она уже оплачена здесь.
- **Промпт на английском.** Русский текст в токенах в ~1.7 раза дороже; промпт читается на каждом ходу (пусть и из кэша).
- Лимит **60 вызовов** на сессию с жёсткой остановкой: после 40-го не начинать новые P1, после 55-го только приёмка и коммит.

---

## 6. Промпт для Fable 5.1

Три сессии. Скопируй блок «COMMON RULES» + блок нужной сессии. Перед запуском: репозиторий чистый, ветка `viora-next`, effort **high**.

### 6.0 COMMON RULES (вставлять в каждую сессию)

```text
# VIORA UPGRADE — common rules (apply to this whole session)

You are upgrading one skill pack in the viora-skills repository. Research is DONE; every
source idea you need is distilled in the task list below. Your job is implementation.

## Cost discipline (hard rules)
1. Do NOT clone, fetch or browse any external repository or URL. Zero exceptions.
2. Read files with `rg -n` / `sed -n A,Bp`. Never `cat` a file over 300 lines. Never read
   `data/*.csv`, `assets/*`, or `evals/fixtures/**` bodies. Never re-read a file you have
   already read in this session; keep notes instead.
3. Write each NEW file in one shot. Edit EXISTING files with minimal patches; never rewrite
   a whole existing file.
4. Reply text is terse: no narration, no plans in prose, no restating the task. One status
   line per finished item: `A2 done — rules/skill-audit.json (+12), viora_skillaudit.py`.
5. Turn budget: 60 tool calls. Do P0 items first, in order. After call 40 do not start a
   new P1 item. After call 55 stop implementing: run acceptance, update docs, commit.
   P2 only if P1 is finished before call 35.
6. Zero new dependencies. Python 3.8+ stdlib only; Node 18+ core modules only. Offline.
7. Effort: keep reasoning short on mechanical steps. This is implementation, not design.

## Engineering rules
- Repository conventions beat this prompt. Match the pack's existing voice: short
  declarative English, tables over prose, rule IDs greppable, "execute, never read" for
  scripts and data.
- Every new rule/pattern has: id, severity, one-line why, one fix line, and (for regexes)
  at least one positive and one negative example in the test fixture.
- Licences: ideas from Trail of Bits (CC BY-SA 4.0), NVIDIA/snyk/impeccable (Apache-2.0)
  and Anthropic are expressed in YOUR words. Do not paste any text from them. Add every
  source you used to ATTRIBUTION.md (create it if missing): source, licence, what idea,
  where it lives, "no text copied".
- Existing tests/self-checks must stay green. Add assertions; never delete or weaken one.
- Bump the version in SKILL.md frontmatter and README badges; add a CHANGELOG entry
  listing each item id you completed.

## Ending (mandatory format)
Run the acceptance commands, then reply with exactly:

VERDICT: DELIVERED | PARTIAL
DONE: <item ids>
NOT DONE: <item ids + one-line reason each>
VERIFIED (command → pasted last lines):
  <cmd> → <output tail>
BELIEVED, NOT VERIFIED: <anything you did not run>
COMMIT: <hash> <message>

A claim with a hedge (should/probably/likely/will) is BELIEVED, not VERIFIED. Then stop.
```

### 6.1 Session 1 — viora-aegis

```text
# SESSION 1/3 — viora-aegis 2.0.0 → 2.1.0
Work only inside `viora-aegis/`. First: `sed -n 1,80p SKILL.md`, `rg -n "def cmd_|add_parser" scripts/viora.py scripts/viora_skillaudit.py`, `python3 -c "import json;print(len(json.load(open('rules/skill-audit.json'))['rules']))"`. Then implement.

## P0
A1 tests + evals. Create `evals/fixtures/` with six tiny repos (≤ 3 files each):
   f01-sqli-true (string-built SQL reaching cursor.execute), f02-sqli-param (parameterised —
   must NOT be reported as a finding by the plan text; the scan may list it as a lead),
   f03-secret-in-test (AWS key in tests/), f04-ci-prt (workflow with pull_request_target +
   checkout of PR head), f05-malicious-skill (SKILL.md that tells the agent to read ~/.ssh
   and curl it out, plus a postinstall hook), f06-fail-open (auth check inside try/except
   that continues on exception). Create `tests/run-all.sh` (bash, no deps) asserting: rule
   ids present/absent per fixture, exit codes 0/1/2 semantics, `baseline` suppresses,
   `--diff` scopes, skill-audit f05 reports tier auto-run + SA-PI + new SA-* rules,
   `report` refuses when findings JSON is invalid (after A5). ≥ 30 assertions. Add
   `tests/README.md` (≤ 30 lines).
A2 Extend `rules/skill-audit.json` (+12) and `scripts/viora_skillaudit.py`:
   SA-TRIG-001 over-broad description ("always", "every task", "for all requests"),
   SA-TRIG-002 claims to replace/override another skill or built-in tool;
   SA-REF-001 anti-refusal ("never refuse", "ignore safety", "bypass guardrails");
   SA-MEM-001 writes to host memory/instruction files (CLAUDE.md, AGENTS.md, .cursorrules,
   ~/.claude/**, memory dirs), SA-MEM-002 asks to persist instructions across sessions;
   SA-MCP-001 tool description containing imperatives to the model (tool poisoning),
   SA-MCP-002 tool name shadowing built-ins (read_file, bash, execute, edit, write_file),
   SA-MCP-003 server config with `*` / unrestricted roots or permissions;
   SA-SNOOP-001 reads other agents' config or credential stores (~/.cursor, ~/.codex,
   ~/.config/gh, ~/.aws, keychain, browser profiles);
   SA-OBF-004 mixed-script / confusable identifiers in names and paths (NFKC-normalise and
   compare); SA-LEAK-001 asks to reveal system prompt / prior instructions;
   SA-FLOW-001 toxic flow — computed in code, not regex: (network fetch OR runtime content
   load) AND (reads secrets/home/env) AND (outbound send) → one HIGH finding listing the
   three file:line anchors. Extend the auto-run tier file list with `.claude/settings.json`
   hooks, `.cursor/mcp.json`, `.codex/config.toml`, `.gemini/settings.json`, `.mcp.json`,
   `hooks/**`, package.json `postinstall|preinstall|prepare`. Update
   `references/10-skill-audit.md` with one table row per new category.
A3 Risk score 0–100 next to the existing `MACHINE PRE-VERDICT` line (keep `_pre_verdict`
   as is; add `risk_score` to the JSON result and to text/markdown output). Formula:
   severity weights × tier multiplier (auto-run ×2, on-invocation ×1.5), capped at 100;
   any SA-PI / SA-FLOW / SA-MEM hit sets a floor of 70. Print "Score is a lead; the tier
   table is the verdict." under it. Update `templates/SKILL_AUDIT_REPORT.md`.
A4 `skill-audit --installed` enumerates skills and MCP configs under known paths for
   Claude Code, Codex, Cursor, Windsurf, Gemini CLI, Copilot, OpenCode, Antigravity (project
   and user scope) and prints a table. `skill-audit --lock` writes `.viora/skills.lock.json`
   {path, sha256 of sorted file hashes, mtime, rule-hit summary}; `--verify` reports
   drift (changed/added/removed files) as HIGH `SA-SUP-006 post-install drift`. Add both to
   `playbooks/05-skill-audit.md` and to SKILL.md §9 and §13 recipes.
A5 `rules/finding.schema.json` (stdlib-validated: required keys, enum severity/verdict, no
   severity allowed when verdict is UNDETERMINED). `report` validates every input JSON
   against it and exits 2 with the first error; prose sections are rendered only from the
   JSON. SKILL.md §5–6: UNDETERMINED carries no severity; say so in one line.
A6 `rules/secrets.json` +10: Azure client secret + storage connection string, GCP
   service-account JSON (`"type": "service_account"` + private_key), Vercel token, Supabase
   service_role JWT, Cloudflare API token, Discord bot token, HuggingFace `hf_`, Docker
   `dckr_pat_`, `AGE-SECRET-KEY-1`, Firebase config with server key. Each with a matching
   and a non-matching sample in f03.
A7 Create `ATTRIBUTION.md`. Update SKILL.md: version 2.1.0, router row text unchanged,
   §4 CLI list (+coverage, fixcheck, skill-audit --installed/--lock/--verify), §11 map.
   Replace any model-name examples with the 2026 lineup (Fable 5.1, Opus 5, Sonnet 5,
   Haiku 4.5, GPT-5.x, Gemini 3). Add `evals/triggers.json`: 20 realistic queries,
   10 should_trigger (incl. RU: "проверь этот MCP перед установкой", "есть ли тут дырки")
   and 10 near-miss should_not_trigger (perf review, style nits, "add login page").

## P1
A8 Coverage ledger. `viora.py coverage init` derives units from `doctor` output: one per
   (entry-point group × trust boundary × rule-category prefix); writes `.viora/coverage.json`
   with status planned. `coverage mark <id> covered|blocked|deferred|out_of_scope --note`.
   `report` builds the "Not assessed" section from units not `covered`; `check` (add if
   missing) exits 1 when an AUDIT run has `planned` units. Playbook 02 step list uses it.
A9 `viora.py fixcheck --base <git-ref> --cmd <argv...>`: run cmd in a temporary worktree
   at base and in the working tree; require a line `VIORA_REACHED` on stdout in both runs
   (else `marker_missing`); expect fail-on-base and pass-on-patch; write a row to
   `.viora/fixes.jsonl` with the code-protocol style tree fingerprint. `report` lists FIX
   items without a green fixcheck row under UNPROVEN. Playbook 03 + SKILL.md §7 item 6.
A10 `references/14-sharp-edges.md` (≤ 90 lines, six footgun classes, own wording) and six
   `DEFAULT-0xx` rules in `rules/defaults.json` (bool security flags, verify/ssl=false
   style, zero-means-infinite lifetimes, string-typed roles/permissions, ignored security
   return values, dangerous combos accepted silently). Playbook 08 gets a "your own API"
   step.
A11 SPEC-CHECK: add to `templates/THREAT_MODEL.md` a "Controls vs code" table with
   columns holds / contradicted / absent / undocumented and to `playbooks/14` a second
   pass to fill it after implementation. SKILL.md router row 9 mentions it.

## P2
A12 Add data-isolation & lifecycle and desktop/local-IPC checklists to `references/09`.
A13 Playbook 04: T2 agents hand each CONFIRMED candidate to a fresh sub-agent with only
    finding + paths (no hunter reasoning) before the verdict is final.

## Acceptance (run all, paste tails)
python3 scripts/viora.py scan --quiet ; echo exit=$?        # expect 0
bash tests/run-all.sh                                        # all green, ≥ 30
python3 scripts/viora.py skill-audit evals/fixtures/f05-malicious-skill --format json | python3 -c "import sys,json;d=json.load(sys.stdin);print(sorted({f['rule'] for f in d['findings']}))"
python3 scripts/viora.py skill-audit evals/fixtures/f05-malicious-skill | rg -n "PRE-VERDICT|risk score"
python3 scripts/viora.py plan skill-audit | rg -n "lock|verify|installed"
for f in rules/*.json; do python3 -m json.tool "$f" >/dev/null && echo ok $f; done
git add -A && git commit -qm "viora-aegis 2.1.0: tests+evals, skill-audit categories, lock/verify, finding schema" && git log -1 --oneline
```

### 6.2 Session 2 — viora-code-protocol

```text
# SESSION 2/3 — viora-code-protocol v2.1 → v2.2
Work only inside `viora-code-protocol/`. First: `sed -n 1,60p SKILL.md`, `rg -n "add_parser\(|^def cmd_" scripts/viora.py`, `sed -n 1,40p templates/report.md`, `bash tests/run-all.sh | tail -3` (baseline 85). Then implement. Every conductor change gets assertions in a new `tests/04-v22.sh` wired into `tests/run-all.sh` (update the expected total).

## P0
B1 Three buckets. Report contract (SKILL.md §8, templates/report.md) becomes:
   VERIFIED (command + pasted tail, produced after the last edit) / BELIEVED, NOT VERIFIED /
   NOT CHECKED (+ what it would take). In `scripts/viora.py`: `report` and `check` scan
   step notes and the rendered report; any VERIFIED line containing a hedge
   (should|will|likely|probably|expect|expected to|once |ought) is moved to BELIEVED with
   the reason "hedge: <word>". A run whose done-test is not in VERIFIED renders
   `VERDICT: NOT DONE` regardless of other green rows. Align evals/rubric g07/g09 wording.
B2 `viora.py decision "<X over Y because Z>" [--irreversible] [--approved]` appends to the
   run; `report` prints a DECISIONS section; `check` exits 1 for --irreversible without
   --approved. SKILL.md §1 CONTRACT adds "DECISION lines for choices that change stored
   data or user-visible behaviour"; §6 adds the route-vs-destination rule (destination =
   alters done-test, deletes/transforms data, changes a public interface, relaxes a stated
   requirement → STOP-AND-ASK).
B3 Expectations and risk order. `gate --expect "<substring>"` for rows named red/repro:
   mismatch marks the row SURPRISE; `next` then prints "SURPRISE on <gate>: re-derive PLAN
   (viora.py plan ...)" and `done 6` is refused until `plan` is re-recorded. `plan
   --risk "<file>=<one-line risk>"` (repeatable) orders FILE lines riskiest-first and
   `next` at step 6 names the riskiest file first. SKILL.md §1 rows 4–5 and
   `references/05-tests-and-evidence.md` get three lines each.
B4 Banned excuses (+2 rows in SKILL.md §7 and `references/14-rationalizations.md`):
   "tool X isn't available" without `which X` output; "the pieces are all correct, so it
   works". `doctor` prints a `which` table for the detected stack's tools.
B5 `references/07-model-tiers.md`: replace the tier table with the 2026 lineup —
   T2: Claude Fable 5.1 / Mythos 5.1 / Opus 5, GPT-5.x, Gemini 3 Pro; T1: Sonnet 5,
   GPT-5-mini-class, Gemini 3 Flash; T0: Haiku 4.5, Flash-Lite/nano, 8–30B local. Add the
   demotion trigger "context past ~60 % of the window". Trim the SKILL.md `description`
   to trigger conditions only (drop the tier/ladder sentence). CHANGELOG "v2.2" listing
   B-items done. Version bump wherever it is printed.
B6 `evals/triggers.json`: 20 realistic queries (10 should, incl. RU "поправь баг в
   экспорте, тесты падают"; 10 near-miss should-not: pure questions, design-only asks,
   security audits that belong to viora-aegis).

## P1
B7 `scripts/less.py` (stdlib only): ranks delete/simplify/replace candidates — wrapper
   functions that only forward, abstractions with one caller, dependencies replaceable by
   the platform (table of ≥ 25 pairs across JS/TS and Python: lodash→native, moment/dayjs→
   Intl/Temporal, axios/request→fetch, uuid→crypto.randomUUID, classnames→template,
   bluebird→Promise, left-pad/is-odd→nothing, pytz→zoneinfo, mock→unittest.mock,
   six→drop, simplejson→json, attrs→dataclasses, requests→urllib for one call…), config
   files for tools not present in deps. Output: ranked table with file:line and the
   replacement. Wire into SKILL.md §1 step 7 (T1/T2) and `scripts/verify.sh` summary. Add
   `references/15-less-code.md` (≤ 80 lines).
B8 `viora.py mutate --file F --line N --test "<cmd>"`: copy F, flip exactly one operator
   on line N (== <-> !=, < <-> <=, > <-> >=, and <-> or, True <-> False, `return X` ->
   `return None`; first match wins, report which), run the test, restore F in
   `try/finally` (also on Ctrl-C), record an evidence row kind=mutation with result
   KILLED|SURVIVED. SURVIVED prints "RED is weak: the test passes with the logic
   inverted". SKILL.md §1 row 5 (T2 FIX): one mutation on the fixed line is required.
B9 `viora.py resume`: one screen — tier, mode, step, plan files + budget, STALE/SURPRISE
   rows, open decisions, last three notes — for a fresh session. Reference it from
   `templates/handoff.md` and SKILL.md §9.

## P2
B10 `doctor --context`: estimate tokens (words × 1.3) of AGENTS.md, CLAUDE.md,
    .cursor/rules/**, .claude/skills/**/SKILL.md, .codex/**; warn above 25k with a
    demotion hint.
B11 `checkpoint --worktree` creates a git worktree for REFACTOR runs ≥ 100 planned lines.

## Acceptance (run all, paste tails)
bash tests/run-all.sh | tail -4                               # ≥ 85 + new, 0 failed
python3 scripts/viora.py doctor | tail -5
python3 scripts/viora.py --help | rg -n "decision|mutate|resume"
python3 evals/score.py --help | head -3
git add -A && git commit -qm "viora-code-protocol v2.2: three buckets, decisions, surprises, 2026 tiers" && git log -1 --oneline
```

### 6.3 Session 3 — viora-design-skills

```text
# SESSION 3/3 — viora-design-skills 4.1.0 → 4.2.0
Work only inside `viora-design-skills/`. First: `sed -n 1,40p SKILL.md`, `rg -n "^### G|^\| G" SKILL.md`, `rg -n "^\t\"?[a-z-]+\"?: \[" scripts/rules/check-rules.mjs | head -80`, `rg -n "^\tL\(\"" scripts/wig.mjs | head -40` (wig rules are `L(id, level, scope, regex, message)` entries in `RULES`), `node scripts/check.mjs --list-rules | wc -l` (66), `node scripts/wig.mjs --list-rules | wc -l` (36). Then implement. Never open data/*.csv or assets/blocks/*.

## P0
C1 `scripts/gate.mjs` (Node core only): `gate.mjs start <job> <mode> <stack> <lane>`,
   `gate.mjs pass G2 "<marker text>"`, `gate.mjs status`. State in `.viora/design-run.json`
   {job, mode, stack, lane, gates:{G0..G7:{at, marker}}}. `verify.mjs` reads it and refuses
   to print a verdict (exit 2, message names the missing gates) when a gate required for
   the job is missing (NEW/REDESIGN: G0–G6; CHANGE: G1,G3,G4,G5; FIX: G1,G4; REVIEW: G1).
   SKILL.md gate table: the Marker column becomes the gate.mjs command; LITE.md records
   four gates (start, G3-equivalent, G6, G7). Add to `selftest.mjs`: start→pass→status
   round trip and the verify refusal.
C2 Structure layer. `reference/20-structure.md` (≤ 160 lines, own names): six structural
   axes (heading placement, body composition, divider language, button voice, image
   treatment, reveal), a menu of 16 named page shapes each with its section order and
   "wrong for", 10 nav archetypes, 6 footer archetypes, and a "not by default" list
   (wordmark+links+button nav; 4-column link footer; hero→3 cards→CTA). G3 Frame outputs
   `STRUCTURE: <shape> / nav <N> / footer <F>` and `reference/12-design-md.md` gains a
   STRUCTURE block. check.mjs rules: `template-rhythm` (warning: a hero section directly
   followed by a grid of exactly three equal cards followed by a CTA band),
   `stock-footer` (warning: footer with ≥ 4 link columns plus a social icon row). Add
   [why, fix, before, after] entries in check-rules.mjs.
C3 Diversification memory. G7 appends to `.viora/design-log.json` {surface, world, palette
   id, type pair, structure, nav, footer, paper band (dark/mid/light), accent hue (warm/
   cool/neutral/other), at}. `pick.mjs --avoid-last` reads the log and excludes the last
   entry's world, palette and structure from results (prints what it excluded). check.mjs
   `repeat-world`: warning when DESIGN.md's WORLD equals the last log entry's world for a
   different surface name. SKILL.md G2/G7 get one line each; `reference/01-direction.md`
   "Rotation rule" points to the mechanism.
C4 Craft rules. check.mjs +7: `offset-shadow` (box-shadow with equal non-zero x/y offsets
   and 0 blur, unless DESIGN.md world is a neobrutal/poster world), `svg-grain`
   (feTurbulence), `stripe-bg` (repeating-linear-gradient on a background), `ghost-card`
   (a rule with 1px border AND box-shadow blur ≥ 20px), `over-tracking` (letter-spacing
   ≤ -0.04em), `system-display-face` (Impact / Arial Black / system-ui / -apple-system as
   the only display family), `glyph-icon` (✓ ✕ → ★ ● ▶ etc. as the sole content of a
   button/nav item). wig.mjs +5: `overlay-inert` (hidden modal/drawer without `inert` or
   aria-hidden), `input-mode` (numeric/tel/email/search inputs missing inputmode or
   enterkeyhint), `anchor-scroll-margin` (in-page anchor targets with a sticky header and
   no scroll-margin-top), `will-change-sprinkle` (> 3 occurrences), `heading-wrap` (hint:
   h1/h2 without text-wrap: balance). Each rule: before/after in check-rules.mjs or the
   wig equivalent; add one positive and one negative sample to selftest.
C5 `lane.mjs`: add claude-fable-5*, claude-mythos-5*, claude-opus-5*, claude-sonnet-5*,
   gpt-5.x (pro/codex → FULL; mini/nano → LITE), gemini-3-pro → FULL, gemini-3-flash →
   LITE, claude-haiku-4-5 → LITE. `docsync.mjs`: compare README.md version badges with
   SKILL.md `version:`; fail on mismatch; fix the README badges. ATTRIBUTION.md +4 rows
   (hallmark MIT, impeccable Apache-2.0, ui-skills MIT, huashu MIT — ideas only, no text).
C6 `evals/triggers.json`: 20 realistic queries (10 should incl. RU "выглядит как шаблон,
   сделай дороже"; 10 near-miss should-not: backend, copywriting-only, "add a route").

## P1
C7 Component scope. G0 detects a single-component brief (one control/card/form, no page)
   and prints `lane FULL, scope COMPONENT`: G2 structure is skipped with one line, G5 emits
   `<Name>.preview.html` from a new `assets/blocks/html/preview-shell.html` that renders 8
   states (default, hover, focus, active, disabled, loading, error, success) via companion
   classes `.is-hover .is-focus .is-active` the component CSS must target alongside the
   real pseudo-classes. wig.mjs `component-states` (error): interactive component styles
   lacking `:focus-visible` or `:disabled/[disabled]`.
C8 `reference/21-verbs.md` (≤ 120 lines): HARDEN (long strings, empty/error/loading,
   RTL/i18n, 200 % zoom, offline, slow network), QUIET<->BOLD (one dial: what to remove /
   what to amplify; never both in one pass), CRITIQUE (≤ 5 findings `file:line — problem
   — fix`, no code written). G0 router rows for each; add the sentence "Refinement
   preserves; redesign replaces; never split the difference" to G0.
C9 `assets/PRODUCT.template.md` (audience scene, truth claims with sources, constraints,
   forbidden claims). G1 loads PRODUCT.md when present (one line). check.mjs `fake-stat`
   extension: when PRODUCT.md exists, a number with % / x / + in copy that does not appear
   there → warning `unsourced-number`.
C10 Job STUDY in G0: reference screenshot/URL → DNA report (structure, type register, colour
    anchor, density, one signature) → optional DESIGN.md. Rules: never copy pixels or copy;
    refuse template marketplaces; ≤ 60 lines in `reference/01-direction.md` §5.

## P2
C11 `palettes.mjs --oklch` emits oklch() with hex fallback; `contrast.mjs` parses oklch().

## Acceptance (run all, paste tails)
node scripts/selftest.mjs | tail -3                          # all checks passed
node scripts/docsync.mjs | tail -2                           # agrees with itself
node scripts/check.mjs --list-rules | wc -l                  # ≥ 73
node scripts/wig.mjs --list-rules | wc -l                    # ≥ 41
node scripts/lane.mjs --model claude-fable-5-1 | head -2   # FULL (today: "unknown model")
node scripts/lane.mjs --model claude-haiku-4-5 | head -2    # LITE
node scripts/gate.mjs start NEW LAND FILE FULL && node scripts/gate.mjs pass G0 "route: test" && node scripts/gate.mjs status && rm -rf .viora
git add -A && git commit -qm "viora-design-skills 4.2.0: gate conductor, structure layer, diversification memory, craft rules" && git log -1 --oneline
```

---

## 7. Порядок запуска и контроль денег

1. Сессия 1 (aegis) → посмотри отчёт `VERDICT` и остаток на счету. Ожидание: ~$20, остаток ~$80.
2. Если остаток < $70 после первой сессии — во второй и третьей сразу напиши в первой строке: `Do P0 only. Skip P1/P2.`
3. Сессия 2 (code-protocol), сессия 3 (design). Между ними — новый чат, новый контекст.
4. Остаток после трёх сессий (~$30–40) — на одну короткую сессию «fix acceptance» если что-то пришло PARTIAL, или на `viora-build`, чтобы он читал общий `.viora/`.

Что получится в итоге: aegis — единственный оффлайн-аудитор скиллов с классами NVIDIA, lock-файлом от дрифта и леджером покрытия; code-protocol — единственный протокол, где хедж в отчёте ловит машина и где RED проверяется мутацией; design — единственный дизайн-скилл с дирижёром ворот, структурным отпечатком и памятью диверсификации. Три скилла, одно состояние `.viora/`, одна дисциплина: ничего не заявлено без вывода команды.
