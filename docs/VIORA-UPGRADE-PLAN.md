# Viora Skills → v-next (v2): план и промпт для Fable 5.1

Заменяет `VIORA-UPGRADE-PLAN-v1.md`. Добавлено после разбора пяти репо из поста «Самые нужные репозитории» (mattpocock/skills, ponytail, hallmark, rohitg00/awesome-claude-code-toolkit, caveman): token-pack в code-protocol, хуки агента во всех трёх скиллах, линейка запахов Фаулера, два правила styleseed. Порядок сессий изменён: code-protocol первым, чтобы `squeeze.py` экономил токены в двух следующих.

Исходное состояние проверено локально: aegis `scan --quiet` → exit 0; code-protocol `tests/run-all.sh` → 85/85; design `selftest.mjs` + `docsync.mjs` → зелёные.

---

## 0. Что изменилось относительно v1

1. **Token-pack** в code-protocol (P0): `squeeze.py` (сжатие вывода команд до чтения), `--terse` регистр с Auto-Clarity, `less.py` с тегами ponytail, `viora:ceiling`-комментарий.
2. **Хуки агента** (X1): aegis secret-scan на Write/Edit, code-protocol `check --hook` как Stop-хук, design `check.mjs` как PostToolUse.
3. **Порядок сессий**: code-protocol → aegis → design.
4. Из mattpocock: 12 запахов Фаулера как шестая линза ревью + ось Spec.
5. Из styleseed (rohitg00): `kpi-clones`, `shadow-opacity`.
6. `mutate` (B8) сдвинут в P2.

## 1. Пять репо из поста — что реально, что уже есть, что берём

| Репо | Что там на самом деле | Уже есть у тебя | Берём |
|---|---|---|---|
| **mattpocock/skills** (MIT) | `/grill-me`: многораундовый допрос с «фронтиром» решений. `/code-review`: два параллельных субагента — Standards (repo-стандарты + 12 запахов Фаулера) и Spec (дифф против исходного issue) | grill влит целиком в `09-clarify-and-grill.md`; risk-first дифф-ревью в `13-differential-review.md` | **B12**: 12 запахов как шестая линза DOUBT; поле `spec:` в `contract` и сверка диффа с ним в REVIEW |
| **DietrichGebert/ponytail** (MIT) | Лестница из 7 ступеней; `ponytail:`-комментарий с потолком; «ship lazy + вопрос в том же ответе»; «где нельзя лениться»; `ponytail-audit` с тегами `delete/stdlib/native/yagni/shrink` и итогом `net: -N lines, -M deps`. Замер: −54 % LOC, −20 % cost, safety 100 % | Solution Ladder 0–6 в `01-recon-and-reuse.md` — та же лестница; дефект Bloat; лимиты §4 | **B7** `less.py` с тегами и `net:`; **B14** `viora:ceiling` + паттерн «ленивая версия + вопрос»; «где нельзя лениться» в `14-rationalizations.md` |
| **Nutlope/hallmark** (MIT) | 21 макроструктура, диверсификация через `log.json`, 57 slop-гейтов, component-scope, `study` | 66 + 36 механических правил | всё в C2/C3/C7/C10 |
| **rohitg00/awesome-claude-code-toolkit** (Apache-2.0) | 40 скиллов-шпаргалок по 5–6 KB, 120 плагинов. Ценное — 20 хуков: PreToolUse `secret-scanner` на Write/Edit, `commit-guard`, `block-dev-server`, `pre-compact`, `stop-check`; `styleseed` — 69 визуальных правил | только git `pre-commit`; рантайм-хуков нет | **X1** хуки во всех трёх; **C13** два правила styleseed |
| **JuliusBrussee/caveman** (скилл MIT, движок BSL-1.1) | Терсный регистр без нарратива тул-коллов, «одна решающая строка ошибки», **никаких выдуманных сокращений** (токенайзер не экономит на `cfg/impl`), Auto-Clarity, обычная проза во всём, что сохраняется. Прокси сжимает логи/тесты/JSON до чтения: −33 % input (54 запуска, 18/18). `caveman-compress` для CLAUDE.md: −46 %. JetBrains A/B: только скилл −8.5 % output без потери качества. Бенч ponytail: caveman в агентном режиме **+7 % токенов** | отчётные шаблоны терсные; `verify.sh` уже `tail -25` | **B13** token-pack: своя реализация идеи прокси (`squeeze.py`), `--terse` opt-in, Auto-Clarity, «нет нарратива тул-коллов» всегда |

## 2. Где уходят деньги

Fable 5.1: вход $10, выход $50, чтение кэша $0.25 за MTok.

| Рычаг | Чужой замер | Где живёт в Viora |
|---|---|---|
| Читать меньше (сжать вывод команд до чтения) | −27…−55 % input на логах/тестах/JSON | `squeeze.py`; `gate` пишет полный лог в `.viora/logs/`, в evidence — сжатый |
| Писать меньше кода | −20 % cost, −54 % LOC | Solution Ladder есть; `less.py` делает её проверяемой |
| Говорить меньше | −8.5 % output; в агентном режиме бывает +7 % | `--terse` opt-in; «нет нарратива тул-коллов» — всегда |
| Кэш | чтение в 40 раз дешевле входа | SKILL.md статичен между ходами; reference один раз |

«Токен-скилл» для Viora — это машина (`squeeze`, `less`, Stop-хук), а не манера речи.

## 3. Пак улучшений

**P0** — сильнее и дёшево; **P1** — уникальность; **P2** — если остались деньги.

### 3.1 viora-code-protocol → v2.2 (сессия 1)

| # | Улучшение | Источник | Файлы | Пр. |
|---|---|---|---|---|
| B1 | Три корзины VERIFIED / BELIEVED / NOT CHECKED; хедж в VERIFIED-строке машина переносит в BELIEVED; done-test не в VERIFIED → `VERDICT: NOT DONE` | Fable-Skill | `viora.py`, `templates/report.md`, SKILL.md §8 | P0 |
| B2 | `viora.py decision "X over Y because Z" [--irreversible] [--approved]`; секция DECISIONS; route vs destination | Fable-Skill | `viora.py`, §1, §6 | P0 |
| B3 | `gate --expect` → SURPRISE блокирует `done 6` до перепланирования; `plan --risk` | Fable-Skill | `viora.py`, §1, `05` | P0 |
| B4 | Banned excuses +2; `doctor` печатает `which`-таблицу | Fable-Skill | §7, `14` | P0 |
| B5 | `07-model-tiers.md` на 2026; демоушен при контексте > 60 %; description только условия срабатывания | superpowers SDO | `07`, frontmatter, CHANGELOG | P0 |
| B6 | `evals/triggers.json` — 20 запросов | skill-creator | `evals/` | P0 |
| **B13** | **Token-pack.** `scripts/squeeze.py`: дедуп повторов, схлопывание стеков из `node_modules`/`site-packages`, снятие ANSI, первые 15 + последние 25 строк + все строки с `FAIL\|ERROR\|Traceback\|assert\|expected`, JSON-массивы > 10 → 3 + `…+N`. `gate` хранит полный вывод в `.viora/logs/`, в evidence кладёт сжатый. `--terse` / `.viora/terse`. `references/16-token-discipline.md` | caveman (идея) | `squeeze.py`, `viora.py`, `16`, SKILL.md §5, §9 | **P0** |
| **B14** | `viora:ceiling` комментарий для сознательных упрощений; `scope` их считает; паттерн «сделал X; Y покрывает; нужен полный X — скажи»; «где нельзя лениться» | ponytail | §2, §4, `14`, `viora.py scope` | P0 |
| B7 | `scripts/less.py`: форвардеры, абстракции с одним вызовом, зависимости→платформа (≥ 25 пар); теги `delete/stdlib/native/yagni/shrink`; `net: -N lines, -M deps` | ponytail | `less.py`, `15-less-code.md`, §1 | P1 |
| **B12** | Шестая линза DOUBT: 12 запахов Фаулера как эвристики; `contract --spec`; REVIEW сверяет дифф со спеком: holds / contradicts / absent / undocumented | mattpocock | `06`, `13`, `viora.py contract` | P1 |
| **B15** | Stop-хук `viora.py check --hook` (exit 2 при STALE/SURPRISE, открытом irreversible, «done» до шага 10); `hooks/agent/claude-code.json`; INSTALL.md | rohitg00 (паттерн) | `viora.py`, `hooks/agent/`, INSTALL.md | P1 |
| B9 | `viora.py resume` — один экран состояния | planning-with-files | `viora.py`, `templates/handoff.md` | P1 |
| B8 | `viora.py mutate` — переворот оператора, KILLED/SURVIVED | ToB (идея) | `viora.py`, `05` | P2 |
| B10 | `doctor --context` — оценка токенов правил | ECC | `viora.py` | P2 |
| B11 | `checkpoint --worktree` | superpowers | `viora.py` | P2 |

### 3.2 viora-aegis → 2.1.0 (сессия 2)

| # | Улучшение | Источник | Файлы | Пр. |
|---|---|---|---|---|
| A1 | tests + evals: 6 фикстур, `tests/run-all.sh` ≥ 30 утверждений | свой code-protocol | `tests/`, `evals/fixtures/` | P0 |
| A2 | +12 правил SKILL-AUDIT: SA-TRIG, SA-REF, SA-MEM, SA-MCP, SA-SNOOP, SA-OBF-004, SA-LEAK, **SA-FLOW-001**; auto-run тир расширен | SkillSpector, snyk | `rules/skill-audit.json`, `viora_skillaudit.py`, `10` | P0 |
| A3 | Risk score 0–100 рядом с `MACHINE PRE-VERDICT` | SkillSpector | `viora_skillaudit.py` | P0 |
| A4 | `skill-audit --installed` / `--lock` / `--verify` | snyk + своё | `viora_skillaudit.py`, playbook 05 | P0 |
| A5 | `rules/finding.schema.json`; `report` из JSON; UNDETERMINED без severity | cloudflare | `viora.py`, §5–6 | P0 |
| A6 | +10 правил секретов | своё | `rules/secrets.json` | P0 |
| A7 | `ATTRIBUTION.md`, версия, модели 2026, `evals/triggers.json` | skill-creator | корень, SKILL.md | P0 |
| **A14** | PreToolUse-хук `hooks/agent/pre-write-secrets.py`: секрет не доходит до диска; `init --agent-hooks` | rohitg00 (паттерн) | `hooks/agent/`, `viora.py init`, adapters | P1 |
| A8 | Coverage ledger | cloudflare | `viora.py`, playbook 02 | P1 |
| A9 | `fixcheck --base --cmd` с маркером `VIORA_REACHED` | ToB (идея) | `viora.py`, playbook 03 | P1 |
| A10 | `14-sharp-edges.md` + 6 `DEFAULT-*` | ToB (идея) | rules, references, playbook 08 | P1 |
| A11 | SPEC-CHECK в THREAT_MODEL.md | ToB (идея) | шаблон, playbook 14 | P1 |
| A12 | Чеклисты data-isolation и desktop/IPC | cloudflare | `09` | P2 |
| A13 | Чистый верификатор для T2 | cloudflare | playbook 04 | P2 |

### 3.3 viora-design-skills → 4.2.0 (сессия 3)

| # | Улучшение | Источник | Файлы | Пр. |
|---|---|---|---|---|
| C1 | `scripts/gate.mjs` — дирижёр ворот; `verify.mjs` без ворот не даёт вердикт | huashu + свой code-protocol | `gate.mjs`, `verify.mjs`, SKILL.md, LITE.md | P0 |
| C2 | Структурный слой `20-structure.md`; `STRUCTURE:` в G3/DESIGN.md; `template-rhythm`, `stock-footer` | hallmark | `20`, `12`, `check.mjs` | P0 |
| C3 | Память диверсификации `.viora/design-log.json`; `pick.mjs --avoid-last`; `repeat-world` | hallmark | `pick.mjs`, `check.mjs`, G2/G7 | P0 |
| C4 | +7 craft-правил в check, +5 в wig | impeccable, ui-skills | `check-rules.mjs`, `check.mjs`, `wig.mjs` | P0 |
| C5 | `lane.mjs` модели 2026; `docsync.mjs` сверяет бейджи; ATTRIBUTION +5 | своё | scripts | P0 |
| C6 | `evals/triggers.json` | skill-creator | `evals/` | P0 |
| **C13** | `kpi-clones`, `shadow-opacity` | styleseed (идеи) | `check.mjs`, `check-rules.mjs` | P1 |
| C7 | Component-scope, `<Name>.preview.html` на 8 состояний; `component-states` | hallmark | `assets/blocks/html/preview-shell.html`, G0/G5 | P1 |
| C8 | `21-verbs.md`: HARDEN / QUIET↔BOLD / CRITIQUE | impeccable | `21`, G0 | P1 |
| C9 | `PRODUCT.template.md`; `unsourced-number` | impeccable | `assets/`, G1, `check.mjs` | P1 |
| C10 | Job STUDY | hallmark | `01`, G0 | P1 |
| **C12** | PostToolUse-хук `scripts/hook-check.mjs` | rohitg00 (паттерн) | `hook-check.mjs`, `install.mjs --agent-hooks` | P2 |
| C11 | OKLCH | своё | scripts | P2 |

### 3.4 Сквозное

- **X1 хуки** (B15 + A14 + C12): один формат `hooks/agent/claude-code.json` в каждом пакете; `viora-build` собирает их в один `.claude/settings.json`.
- **Единый `.viora/`**: code-protocol — ядро; aegis — `baseline`, `skills.lock.json`, `coverage.json`; design — `design-run.json`, `design-log.json`; общие `.viora/logs/`.
- **Лицензии**: ToB — CC BY-SA, только идеи; Apache-2.0 (NVIDIA, snyk, impeccable, rohitg00) — атрибуция, текст не копировать; caveman-движок BSL — не трогать, `squeeze.py` с нуля; MIT — переписывать в голосе Viora.
- **Не делать**: не расширять `data/*.csv`, ноль зависимостей, 85 тестов только дополнять, SKILL.md — точечные патчи.

## 4. Бюджет: $100

Модель сессии (≈ 65 вызовов, контекст 30K → 110K, кэш-хиты ~85 %, effort **high**): вход без кэша 0.65M → $6.5; из кэша 3.7M → $0.9; запись кэша → $2; output + thinking ~3.5K/ход → $11.4. **≈ $21–24 за сессию**, три сессии ≈ $70, резерв $30.

Худший случай без кэша: ~$45 за сессию → только P0 во всех трёх, укладывается впритык. Поэтому:

- **Effort `high`, не `Xhigh`** (на скриншоте Xhigh — лишний thinking по $50/MTok на механическую работу).
- Три отдельные сессии, чистый контекст, промпт на английском, никакого клонирования чужих репо.
- 65 вызовов на сессию: после 45-го не начинать P1, после 60-го — только приёмка и коммит.
- После сессии 1: **остаток < $72 → в сессиях 2–3 первой строкой `Do P0 only. Skip P1/P2.`**

## 5. Промпт для Fable 5.1

Перед запуском: чистый репозиторий, ветка `viora-next`, effort **high**. Копируешь COMMON RULES + блок сессии.

### 5.0 COMMON RULES (в каждую сессию)

```text
# VIORA UPGRADE — common rules (apply to this whole session)

You are upgrading one skill pack in the viora-skills repository. Research is DONE; every
source idea you need is distilled in the task list below. Your job is implementation.

## Cost discipline (hard rules)
1. Do NOT clone, fetch or browse any external repository or URL. Zero exceptions.
2. Read files with `rg -n` / `sed -n A,Bp`. Never `cat` a file over 300 lines. Never read
   `data/*.csv`, `assets/*`, or `evals/fixtures/**` bodies. Never re-read a file you have
   already read in this session; keep notes instead.
3. If `viora-code-protocol/scripts/squeeze.py` exists, pipe every command output longer
   than 40 lines through it: `<cmd> 2>&1 | python3 ../viora-code-protocol/scripts/squeeze.py`.
4. Write each NEW file in one shot. Edit EXISTING files with minimal patches; never rewrite
   a whole existing file.
5. Reply register: no narration of tool calls, no plans in prose, no restating the task,
   no pleasantries. One status line per finished item:
   `B13 done — scripts/squeeze.py, viora.py gate, references/16-token-discipline.md`.
   Quote the single decisive line of an error, not the log. Normal prose in anything
   persisted: code comments, commit messages, docs.
6. Turn budget: 65 tool calls. P0 items first, in order. After call 45 do not start a
   new P1 item. After call 60 stop implementing: run acceptance, update docs, commit.
   P2 only if P1 is finished before call 40.
7. Zero new dependencies. Python 3.8+ stdlib only; Node 18+ core modules only. Offline.
8. Keep reasoning short on mechanical steps. This is implementation, not design.

## Engineering rules
- Repository conventions beat this prompt. Match the pack's existing voice: short
  declarative English, tables over prose, rule IDs greppable, "execute, never read" for
  scripts and data.
- Every new rule/pattern has: id, severity, one-line why, one fix line, and (for regexes)
  at least one positive and one negative example in a test fixture.
- Licences: ideas from Trail of Bits (CC BY-SA 4.0), NVIDIA / snyk / impeccable / rohitg00
  (Apache-2.0), caveman (skill MIT, engine BSL — do not look at or reproduce engine code),
  and Anthropic are expressed in YOUR words. Do not paste text from them. Add every source
  you used to ATTRIBUTION.md (create it if missing): source, licence, idea, where it lives,
  "no text copied".
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

### 5.1 Session 1 — viora-code-protocol

```text
# SESSION 1/3 — viora-code-protocol v2.1 → v2.2
Work only inside `viora-code-protocol/`. First: `sed -n 1,60p SKILL.md`,
`rg -n "add_parser\(|^def cmd_" scripts/viora.py`, `sed -n 1,40p templates/report.md`,
`bash tests/run-all.sh | tail -3` (baseline 85). Then implement. Every conductor change
gets assertions in a new `tests/04-v22.sh` wired into `tests/run-all.sh` (update the
expected total).

## P0
B13 Token-pack. (a) `scripts/squeeze.py` (stdlib): reads stdin or a file; strips ANSI;
   collapses identical consecutive lines to one line + ` ×N`; collapses stack frames whose
   path contains node_modules|site-packages|vendor|dist-packages to one line `… N frames in
   <root>`; keeps the first 15 and last 25 lines plus every line matching
   /FAIL|ERROR|Error|assert|Traceback|expected|received|✗|✘/i; JSON input: arrays longer
   than 10 → first 3 items + `…+N`, strings longer than 200 chars truncated with length;
   prints a footer `squeezed <in>→<out> lines`. Flags: `--keep N`, `--tail N`, `--json`.
   (b) `gate` writes the full command output to `.viora/logs/<ts>-<gate>.log` and stores
   the squeezed text in the evidence row; `report` links the full log per row; `evidence`
   prints squeezed by default, `--full` for the raw file. (c) `viora.py --terse` global flag
   or a `.viora/terse` file: conductor prints one line per command (status, next step,
   gate verdict); errors still exact. (d) `references/16-token-discipline.md` (≤ 80 lines):
   where an agentic bill goes (reading > writing > talking); the four levers with the
   published figures (proxy-style squeezing −27…−55 % input; lazy code −20 % cost; terse
   speech −8.5 % output, can be +7 % in agentic runs — so terse is opt-in, squeezing is
   default); terse register rules (no tool-call narration, one decisive error line, no
   invented abbreviations — the tokenizer saves nothing on cfg/impl/req, keep
   not/never/only exact); Auto-Clarity: plain full sentences for security warnings,
   irreversible actions, multi-step order; normal prose in anything persisted.
   SKILL.md §5 (evidence) gets two lines on squeezed vs full log; §9 lists squeeze.py.
B14 `viora:ceiling` comments. SKILL.md §4 gains a row: a deliberate simplification with a
   known ceiling carries `viora:ceiling <ceiling>; <upgrade path>` on the line above;
   `scope` counts them and `report` lists them under FOLLOW-UPS. §2 FEATURE gains the
   pattern: ship the lazy version and question the rest in the same reply — "Did X; Y
   covers it. Need full X? Say so." `references/14-rationalizations.md` gains a
   "Where laziness is forbidden" block: validation at trust boundaries, error handling
   that prevents data loss, security controls, accessibility basics, anything the user
   explicitly asked for.
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
   functions that only forward, abstractions with one caller, interfaces with one
   implementation, config values never set, dependencies replaceable by the platform
   (table of ≥ 25 pairs across JS/TS and Python: lodash→native, moment/dayjs→Intl/Temporal,
   axios/request→fetch, uuid→crypto.randomUUID, classnames→template, bluebird→Promise,
   left-pad/is-odd→nothing, pytz→zoneinfo, mock→unittest.mock, six→drop, simplejson→json,
   attrs→dataclasses, requests→urllib for one call…), config files for tools absent from
   deps. Output: one line per finding, ranked biggest cut first, tagged
   `delete: | stdlib: | native: | yagni: | shrink:` with the replacement and path; footer
   `net: -<N> lines, -<M> deps possible` or `Lean already.` Correctness, security and
   performance are out of scope (say so in --help). Wire into SKILL.md §1 step 7 (T1/T2)
   and `scripts/verify.sh` summary. Add `references/15-less-code.md` (≤ 80 lines).
B12 Review depth. `references/06-review-and-report.md`: a sixth lens "smells" — twelve
   Fowler smells as labelled heuristics ("possible Feature Envy"), each with one fix line;
   a documented repo standard always wins; skip what tooling already enforces.
   `contract --spec <path-or-url>` records the originating issue/spec; in REVIEW mode
   `report` adds a SPEC section: holds / contradicts / absent / undocumented, with
   "no spec available" when none was recorded. `13-differential-review.md` gets the step.
B15 Stop hook. `viora.py check --hook` reads Claude Code hook JSON from stdin, exits 2 with
   a one-line reason when: any evidence row is STALE or SURPRISE; an --irreversible
   decision lacks --approved; the run is below step 10 and the last assistant text
   contains done|fixed|works|complete. Add `hooks/agent/claude-code.json` (Stop →
   `check --hook`; PreCompact → `resume` output injected) and an "Agent hooks" section in
   INSTALL.md with the settings.json snippet and a note that Cursor/Codex equivalents are
   documented paths only.
B9 `viora.py resume`: one screen — tier, mode, step, plan files + budget, STALE/SURPRISE
   rows, open decisions, ceilings, last three notes — for a fresh session. Reference it
   from `templates/handoff.md` and SKILL.md §9.

## P2
B8 `viora.py mutate --file F --line N --test "<cmd>"`: copy F, flip exactly one operator on
   line N (== <-> !=, < <-> <=, > <-> >=, and <-> or, True <-> False, `return X` ->
   `return None`; first match wins), run the test, restore F in try/finally, record an
   evidence row kind=mutation with KILLED|SURVIVED. SURVIVED prints "RED is weak".
B10 `doctor --context`: estimate tokens (words × 1.3) of AGENTS.md, CLAUDE.md,
    .cursor/rules/**, .claude/skills/**/SKILL.md; warn above 25k with a demotion hint.
B11 `checkpoint --worktree` for REFACTOR runs ≥ 100 planned lines.

## Acceptance (run all, paste tails)
bash tests/run-all.sh | tail -4                               # ≥ 85 + new, 0 failed
python3 -c "print('\n'.join(['ok']*3+['Error: boom']+['at x (node_modules/a.js:1)']*40+['done']))" | python3 scripts/squeeze.py | tail -6
python3 scripts/viora.py --help | rg -n "decision|resume|--terse"
python3 scripts/viora.py doctor --terse | tail -3
echo '{}' | python3 scripts/viora.py check --hook; echo exit=$?
git add -A && git commit -qm "viora-code-protocol v2.2: token-pack, three buckets, decisions, surprises, stop hook, 2026 tiers" && git log -1 --oneline
```

### 5.2 Session 2 — viora-aegis

```text
# SESSION 2/3 — viora-aegis 2.0.0 → 2.1.0
Work only inside `viora-aegis/`. First: `sed -n 1,80p SKILL.md`, `rg -n "def cmd_|add_parser"
scripts/viora.py scripts/viora_skillaudit.py`, `python3 -c "import json;print(len(json.load(
open('rules/skill-audit.json'))['rules']))"`. Then implement.

## P0
A1 tests + evals. Create `evals/fixtures/` with six tiny repos (≤ 3 files each):
   f01-sqli-true (string-built SQL reaching cursor.execute), f02-sqli-param (parameterised —
   the plan text must NOT call it a finding; the scan may list a lead), f03-secret-in-test
   (AWS key in tests/), f04-ci-prt (workflow with pull_request_target + checkout of PR
   head), f05-malicious-skill (SKILL.md telling the agent to read ~/.ssh and curl it out,
   plus a postinstall hook and an .mcp.json with `*` permissions), f06-fail-open (auth
   check inside try/except that continues on exception). Create `tests/run-all.sh` (bash,
   no deps) asserting: rule ids present/absent per fixture, exit codes 0/1/2 semantics,
   `baseline` suppresses, `--diff` scopes, skill-audit f05 reports tier auto-run + SA-PI +
   new SA-* rules, `report` refuses invalid findings JSON (after A5). ≥ 30 assertions.
   `tests/README.md` ≤ 30 lines.
A2 Extend `rules/skill-audit.json` (+12) and `scripts/viora_skillaudit.py`:
   SA-TRIG-001 over-broad description ("always", "every task", "for all requests"),
   SA-TRIG-002 claims to replace/override another skill or built-in tool;
   SA-REF-001 anti-refusal ("never refuse", "ignore safety", "bypass guardrails");
   SA-MEM-001 writes to host memory/instruction files (CLAUDE.md, AGENTS.md, .cursorrules,
   ~/.claude/**, memory dirs), SA-MEM-002 asks to persist instructions across sessions;
   SA-MCP-001 tool description with imperatives to the model (tool poisoning),
   SA-MCP-002 tool name shadowing built-ins (read_file, bash, execute, edit, write_file),
   SA-MCP-003 server config with `*` / unrestricted roots or permissions;
   SA-SNOOP-001 reads other agents' config or credential stores (~/.cursor, ~/.codex,
   ~/.config/gh, ~/.aws, keychain, browser profiles);
   SA-OBF-004 mixed-script / confusable identifiers (NFKC-normalise and compare);
   SA-LEAK-001 asks to reveal system prompt / prior instructions;
   SA-FLOW-001 toxic flow — computed in code, not regex: (network fetch OR runtime content
   load) AND (reads secrets/home/env) AND (outbound send) → one HIGH finding listing the
   three file:line anchors. Extend the auto-run tier file list with `.claude/settings.json`
   hooks, `.cursor/mcp.json`, `.codex/config.toml`, `.gemini/settings.json`, `.mcp.json`,
   `hooks/**`, package.json postinstall|preinstall|prepare. `references/10-skill-audit.md`:
   one table row per new category.
A3 Risk score 0–100 next to the existing `MACHINE PRE-VERDICT` line (keep `_pre_verdict`;
   add `risk_score` to JSON and text/markdown output). Severity weights × tier multiplier
   (auto-run ×2, on-invocation ×1.5), capped at 100; any SA-PI / SA-FLOW / SA-MEM hit sets
   a floor of 70. Print "Score is a lead; the tier table is the verdict." under it.
   Update `templates/SKILL_AUDIT_REPORT.md`.
A4 `skill-audit --installed` enumerates skills and MCP configs under known paths for
   Claude Code, Codex, Cursor, Windsurf, Gemini CLI, Copilot, OpenCode, Antigravity
   (project and user scope) and prints a table. `--lock` writes `.viora/skills.lock.json`
   {path, sha256 of sorted file hashes, mtime, rule-hit summary}; `--verify` reports drift
   (changed/added/removed files) as HIGH `SA-SUP-006 post-install drift`. Add to
   `playbooks/05-skill-audit.md`, SKILL.md §9 and §13.
A5 `rules/finding.schema.json` (stdlib-validated: required keys, enum severity/verdict, no
   severity when verdict is UNDETERMINED). `report` validates every input JSON and exits 2
   with the first error; prose is rendered only from the JSON. SKILL.md §5–6: one line —
   UNDETERMINED carries no severity.
A6 `rules/secrets.json` +10: Azure client secret + storage connection string, GCP
   service-account JSON, Vercel token, Supabase service_role JWT, Cloudflare API token,
   Discord bot token, HuggingFace hf_, Docker dckr_pat_, AGE-SECRET-KEY-1, Firebase server
   key. Each with a matching and a non-matching sample in f03.
A7 Create `ATTRIBUTION.md`. SKILL.md: version 2.1.0, §4 CLI list (+coverage, fixcheck,
   skill-audit --installed/--lock/--verify, init --agent-hooks), §11 map; model examples →
   2026 lineup. `evals/triggers.json`: 20 realistic queries, 10 should_trigger (incl. RU
   "проверь этот MCP перед установкой", "есть ли тут дырки") and 10 near-miss
   should_not_trigger (perf review, style nits, "add login page").

## P1
A14 Agent hook. `hooks/agent/pre-write-secrets.py` (stdlib): reads Claude Code PreToolUse
   JSON from stdin (tool_name Write|Edit, tool_input.content / new_string / file_path),
   runs every regex in `rules/secrets.json` over the content, exits 2 with one line
   `SECRET-0xx <title> in <file_path>` on a hit (the write is blocked), 0 otherwise; never
   prints the matched value. `hooks/agent/claude-code.json` with the PreToolUse entry.
   `viora.py init --agent-hooks` merges it into `.claude/settings.json` (create or
   append, never overwrite other hooks). `adapters/INTEGRATION.md`: "Agent hooks" section.
   Test: a fixture write with an AWS key exits 2; a benign write exits 0.
A8 Coverage ledger. `viora.py coverage init` derives units from `doctor` output (entry-point
   group × trust boundary × rule-category prefix) → `.viora/coverage.json`, status planned.
   `coverage mark <id> covered|blocked|deferred|out_of_scope --note`. `report` builds the
   "Not assessed" section from units not covered; `check` exits 1 when an AUDIT run has
   planned units. Playbook 02 uses it.
A9 `viora.py fixcheck --base <git-ref> --cmd <argv...>`: run in a temporary worktree at
   base and in the working tree; require a `VIORA_REACHED` line on stdout in both runs
   (else marker_missing); expect fail-on-base / pass-on-patch; append to `.viora/fixes.jsonl`
   with a tree fingerprint. `report` lists FIX items without a green row under UNPROVEN.
   Playbook 03 + SKILL.md §7 item 6.
A10 `references/14-sharp-edges.md` (≤ 90 lines, six footgun classes, own wording) and six
   `DEFAULT-0xx` rules in `rules/defaults.json` (bool security flags, verify/ssl=false
   style, zero-means-infinite lifetimes, string-typed roles, ignored security return
   values, dangerous combos accepted silently). Playbook 08: "your own API" step.
A11 SPEC-CHECK: `templates/THREAT_MODEL.md` gains a "Controls vs code" table (holds /
   contradicted / absent / undocumented); `playbooks/14` a second pass after
   implementation. SKILL.md router row 9 mentions it.

## P2
A12 data-isolation & lifecycle and desktop/local-IPC checklists in `references/09`.
A13 Playbook 04: T2 agents hand each CONFIRMED candidate to a fresh sub-agent with only
    finding + paths before the verdict is final.

## Acceptance (run all, paste tails; pipe long output through squeeze.py per common rule 3)
python3 scripts/viora.py scan --quiet ; echo exit=$?        # expect 0
bash tests/run-all.sh                                        # all green, ≥ 30
python3 scripts/viora.py skill-audit evals/fixtures/f05-malicious-skill --format json | python3 -c "import sys,json;d=json.load(sys.stdin);print(d['risk_score'], sorted({f['rule'] for f in d['findings']}))"
python3 scripts/viora.py skill-audit evals/fixtures/f05-malicious-skill | rg -n "PRE-VERDICT|risk score"
python3 scripts/viora.py plan skill-audit | rg -n "lock|verify|installed"
for f in rules/*.json; do python3 -m json.tool "$f" >/dev/null && echo ok $f; done
git add -A && git commit -qm "viora-aegis 2.1.0: tests+evals, skill-audit categories, lock/verify, finding schema, agent hook" && git log -1 --oneline
```

### 5.3 Session 3 — viora-design-skills

```text
# SESSION 3/3 — viora-design-skills 4.1.0 → 4.2.0
Work only inside `viora-design-skills/`. First: `sed -n 1,40p SKILL.md`,
`rg -n "^### G|^\| G" SKILL.md`, `rg -n "^\t\"?[a-z-]+\"?: \[" scripts/rules/check-rules.mjs
| head -80`, `rg -n "^\tL\(\"" scripts/wig.mjs | head -40` (wig rules are
`L(id, level, scope, regex, message)` entries in RULES), `node scripts/check.mjs
--list-rules | wc -l` (66), `node scripts/wig.mjs --list-rules | wc -l` (36). Then
implement. Never open data/*.csv or assets/blocks/*.

## P0
C1 `scripts/gate.mjs` (Node core only): `gate.mjs start <job> <mode> <stack> <lane>`,
   `gate.mjs pass G2 "<marker text>"`, `gate.mjs status`. State in `.viora/design-run.json`
   {job, mode, stack, lane, gates:{G0..G7:{at, marker}}}. `verify.mjs` reads it and refuses
   to print a verdict (exit 2, names the missing gates) when a gate required for the job
   is missing (NEW/REDESIGN: G0–G6; CHANGE: G1,G3,G4,G5; FIX: G1,G4; REVIEW: G1).
   SKILL.md gate table: the Marker column becomes the gate.mjs command; LITE.md records
   four gates (start, G3-equivalent, G6, G7). selftest: start→pass→status round trip and
   the verify refusal.
C2 Structure layer. `reference/20-structure.md` (≤ 160 lines, own names): six structural
   axes (heading placement, body composition, divider language, button voice, image
   treatment, reveal), 16 named page shapes each with section order and "wrong for",
   10 nav archetypes, 6 footer archetypes, a "not by default" list (wordmark+links+button
   nav; 4-column link footer; hero→3 cards→CTA). G3 outputs `STRUCTURE: <shape> / nav <N>
   / footer <F>`; `reference/12-design-md.md` gains a STRUCTURE block. check.mjs rules:
   `template-rhythm` (warning: hero directly followed by a grid of exactly three equal
   cards followed by a CTA band), `stock-footer` (warning: footer with ≥ 4 link columns
   plus a social icon row). [why, fix, before, after] entries in check-rules.mjs.
C3 Diversification memory. G7 appends to `.viora/design-log.json` {surface, world, palette
   id, type pair, structure, nav, footer, paper band (dark/mid/light), accent hue
   (warm/cool/neutral/other), at}. `pick.mjs --avoid-last` excludes the last entry's
   world, palette and structure (prints what it excluded). check.mjs `repeat-world`:
   warning when DESIGN.md WORLD equals the last log entry's world for a different surface.
   SKILL.md G2/G7 one line each; `01-direction.md` Rotation rule points to the mechanism.
C4 Craft rules. check.mjs +7: `offset-shadow` (equal non-zero x/y offsets, 0 blur, unless
   DESIGN.md world is a poster/neobrutal world), `svg-grain` (feTurbulence), `stripe-bg`
   (repeating-linear-gradient background), `ghost-card` (1px border AND box-shadow blur ≥
   20px in one rule), `over-tracking` (letter-spacing ≤ -0.04em), `system-display-face`
   (Impact / Arial Black / system-ui as the only display family), `glyph-icon` (✓ ✕ → ★ ● ▶
   as the sole content of a button/nav item). wig.mjs +5: `overlay-inert` (hidden
   modal/drawer without inert or aria-hidden), `input-mode` (numeric/tel/email/search
   inputs missing inputmode or enterkeyhint), `anchor-scroll-margin` (in-page anchor
   targets with a sticky header and no scroll-margin-top), `will-change-sprinkle` (> 3
   occurrences), `heading-wrap` (hint: h1/h2 without text-wrap: balance). Each rule:
   before/after entry and one positive + one negative selftest sample.
C5 `lane.mjs`: add claude-fable-5*, claude-mythos-5*, claude-opus-5*, claude-sonnet-5*,
   gpt-5.x (pro/codex → FULL; mini/nano → LITE), gemini-3-pro → FULL, gemini-3-flash →
   LITE, claude-haiku-4-5 → LITE. `docsync.mjs`: compare README.md version badges with
   SKILL.md `version:`; fail on mismatch; fix the README badges. ATTRIBUTION.md +5 rows
   (hallmark MIT, impeccable Apache-2.0, ui-skills MIT, huashu MIT, styleseed/rohitg00
   Apache-2.0 — ideas only, no text).
C6 `evals/triggers.json`: 20 realistic queries (10 should incl. RU "выглядит как шаблон,
   сделай дороже"; 10 near-miss should-not: backend, copywriting-only, "add a route").

## P1
C13 check.mjs +2: `kpi-clones` (warning: ≥ 4 sibling cards with identical markup
   structure where only numbers differ), `shadow-opacity` (warning: box-shadow alpha
   > 0.12 outside a dark-scheme block). Before/after entries + selftest samples.
C7 Component scope. G0 detects a single-component brief and prints `lane FULL, scope
   COMPONENT`: G2 structure is skipped with one line; G5 emits `<Name>.preview.html` from
   a new `assets/blocks/html/preview-shell.html` rendering 8 states (default, hover,
   focus, active, disabled, loading, error, success) via companion classes `.is-hover
   .is-focus .is-active` the component CSS must target alongside the real pseudo-classes.
   wig.mjs `component-states` (error): interactive component styles lacking
   `:focus-visible` or `:disabled/[disabled]`.
C8 `reference/21-verbs.md` (≤ 120 lines): HARDEN (long strings, empty/error/loading,
   RTL/i18n, 200 % zoom, offline, slow network), QUIET<->BOLD (one dial; never both in one
   pass), CRITIQUE (≤ 5 findings `file:line — problem — fix`, no code). G0 router rows;
   add "Refinement preserves; redesign replaces; never split the difference" to G0.
C9 `assets/PRODUCT.template.md` (audience scene, truth claims with sources, constraints,
   forbidden claims). G1 loads PRODUCT.md when present. check.mjs `unsourced-number`:
   when PRODUCT.md exists, a number with % / x / + in copy that does not appear there →
   warning.
C10 Job STUDY in G0: reference screenshot/URL → DNA report (structure, type register,
    colour anchor, density, one signature) → optional DESIGN.md. Never copy pixels or
    copy; refuse template marketplaces; ≤ 60 lines in `reference/01-direction.md` §5.

## P2
C12 `scripts/hook-check.mjs`: reads Claude Code PostToolUse JSON from stdin, takes
    tool_input.file_path, and if it ends with .css/.html/.tsx/.jsx/.vue/.svelte runs
    check.mjs + wig.mjs on that file and prints ≤ 10 findings, exit 0 always.
    `install.mjs --agent-hooks` merges a PostToolUse entry into `.claude/settings.json`.
C11 `palettes.mjs --oklch` emits oklch() with hex fallback; `contrast.mjs` parses oklch().

## Acceptance (run all, paste tails)
node scripts/selftest.mjs | tail -3                          # all checks passed
node scripts/docsync.mjs | tail -2                           # agrees with itself
node scripts/check.mjs --list-rules | wc -l                  # ≥ 73 (≥ 75 with C13)
node scripts/wig.mjs --list-rules | wc -l                    # ≥ 41
node scripts/lane.mjs --model claude-fable-5-1 | head -2     # FULL (today: "unknown model")
node scripts/lane.mjs --model claude-haiku-4-5 | head -2     # LITE
node scripts/gate.mjs start NEW LAND FILE FULL && node scripts/gate.mjs pass G0 "route: test" && node scripts/gate.mjs status && rm -rf .viora
git add -A && git commit -qm "viora-design-skills 4.2.0: gate conductor, structure layer, diversification memory, craft rules" && git log -1 --oneline
```

## 6. Порядок запуска

1. **Сессия 1 — code-protocol.** Даёт `squeeze.py`, три корзины, Stop-хук. Ожидание ~$22, остаток ~$78.
2. Смотри остаток. **< $72 → в сессиях 2–3 первой строкой `Do P0 only. Skip P1/P2.`**
3. **Сессия 2 — aegis**, **сессия 3 — design.** Новый чат на каждую. Вывод команд идёт через `squeeze.py`.
4. Остаток (~$25–30) — короткая сессия «fix acceptance», если пришло PARTIAL, или `viora-build`: собрать три `hooks/agent/claude-code.json` в один `.claude/settings.json` и читать общий `.viora/`.

Что получится: aegis — оффлайн-аудитор скиллов с категориями NVIDIA, lock-файлом от дрифта и хуком, который не даёт секрету дойти до диска; code-protocol — протокол, где хедж ловит машина, вывод команд сжимается до чтения, а ход нельзя закончить со STALE-доказательствами; design — дизайн-скилл с дирижёром ворот, структурным отпечатком и памятью диверсификации. Три скилла, одно состояние `.viora/`, одни хуки, одна дисциплина.
