---
name: agent-harness
description: >
  Build and run custom agents using a structured harness framework with orchestrator-driven
  task execution. The harness uses a major agent as orchestrator that: (1) creates task
  directories under the agent's workdir for context sharing, (2) spawns planner subagents
  to decompose work, (3) spawns worker subagents to execute, (4) spawns evaluator subagents
  to score output, (5) loops plan→execute→evaluate until evaluation passes, and (6) runs
  skill evolution based on accumulated experience. Use when the user wants to: create a new
  custom agent with the harness pattern, scaffold an agent project with plan/execute/evaluate
  loops, build an agent that self-improves from experience, set up multi-agent orchestration
  with shared task directories, or any task involving 'agent harness', 'build agent',
  'create agent', 'agent framework', 'orchestrator agent', 'plan execute evaluate',
  'agent loop', or 'self-evolving agent'.
---

# Agent Harness Framework

Build custom agents that follow a structured orchestrator pattern: plan → execute → evaluate → loop → evolve.

## Architecture

```
workdir/                          # Agent's root working directory
├── {agent-name}.json             # Agent config (goes to .kiro/agents/)
├── tasks/
│   ├── {task-id}/                # One dir per task execution
│   │   ├── goal.md               # Task goal, acceptance criteria, and evaluation rubric
│   │   ├── plan.md               # Latest planner output (symlink or copy)
│   │   ├── work/                 # Latest worker output artifacts
│   │   ├── eval.md               # Latest evaluator scores and feedback
│   │   ├── iterations.json       # Loop history with scores and changelog
│   │   ├── history/              # Versioned snapshots per round
│   │   │   ├── round-1/
│   │   │   │   ├── plan.md
│   │   │   │   ├── work/
│   │   │   │   ├── eval.md
│   │   │   │   └── changelog.md  # What changed from previous round
│   │   │   ├── round-2/
│   │   │   │   └── ...
│   │   │   └── ...
│   │   └── context/              # Shared context from other agents/runs
│   └── ...
├── evolution/
│   ├── experience-log.json       # Raw execution history (append-only)
│   └── lessons.md                # Curated lessons (<200 lines)
└── skills/
    └── {skill-name}/SKILL.md     # Agent-specific skills
```

## Workflow

### 1. Scaffold Agent

Create the agent workdir and config. Use [references/agent-schema.md](references/agent-schema.md) for the full config schema.

```
mkdir -p {workdir}/tasks {workdir}/evolution {workdir}/skills
```

Generate `{agent-name}.json` with:
- `tools`: must include `subagent`, `fs_read`, `fs_write`, `fs_list`, `shell`
- `toolsSettings.subagent.trustedAgents`: list dedicated subagent names (not `"default"` — see Subagent Design below)
- `resources`: link to this skill + any domain skills
- `prompt`: include the orchestrator instructions (see Orchestrator Prompt below), referencing subagents by name

Generate a separate agent config for each subagent role (planner, worker, evaluator). See Subagent Design below.

### 2. Create Task

For each goal, create a task directory:

```
task_id="{slug}-$(head -c4 /dev/urandom | xxd -p)"
mkdir -p {workdir}/tasks/${task_id}/{work,context,history}
```

Task ID format: `{slug}-{8char_hex}` (e.g., `blog-post-draft-a1b2c3d4`). The slug is a short kebab-case name derived from the task goal (3-5 words max), and the hex suffix prevents collisions.

To resume an existing task, the user provides the task dir name (e.g., "resume blog-post-draft-a1b2c3d4"). The orchestrator should:
1. Check `{workdir}/tasks/{task_id}/` exists
2. Read `iterations.json` to determine which step to resume from
3. Read `eval.md` if it exists — if FAIL, resume from Plan step with eval feedback
4. If no `eval.md`, check what files exist: no `plan.md` → start from Plan, no `work/` output → start from Execute, no `eval.md` → start from Evaluate

To refine a completed task (user sends follow-up feedback after PASS or max iterations):
1. The orchestrator stays on the same task — does NOT create a new one
2. Writes the user's feedback to `context/prev-eval.md`
3. Re-enters the loop from Plan step, continuing the iteration count
4. This is the default behavior for any follow-up message. Only start a new task if the user explicitly asks for a different topic.

Write `goal.md` with:
- Goal statement (what to achieve)
- Acceptance criteria (how to know it's done)
- Evaluation rubric (custom scoring dimensions for this task — see Evaluation Rubric Design below)
- Settings (optional — overrides agent defaults):
  - `pass_threshold`: minimum score each dimension must meet to PASS (omit to use agent default)
  - `max_iterations`: maximum plan→execute→evaluate loops (omit to use agent default)

Settings precedence: goal.md Settings section > orchestrator prompt defaults. If goal.md omits Settings, the orchestrator's defaults apply.

Example `goal.md`:
```markdown
## Goal
피카츄 배구 게임의 공 물리 시스템 구현 (중력, 충돌, 반사)

## Acceptance Criteria
- 공에 중력이 적용되어 자연스럽게 낙하
- 피카츄, 네트, 바닥, 벽, 천장과의 충돌 감지 및 반사 동작
- 프레임 독립적인 물리 업데이트 (델타 타임 적용)
- 물리 상수(중력, 반발 계수)가 설정 파일로 분리

## Evaluation Rubric
| Dimension | Weight | What to check |
|-----------|--------|---------------|
| Gameplay Correctness | 0.35 | 충돌 감지가 정확하고 반사 벡터가 올바름 |
| Code Structure | 0.25 | 물리 엔진이 독립 모듈로 분리, 상수 외부화 |
| Frame Independence | 0.20 | 델타 타임 적용, 다양한 프레임 레이트에서 일관된 동작 |
| Game Balance | 0.20 | 공 속도와 중력이 플레이 가능한 수준 |

## Settings
- pass_threshold: 8
- max_iterations: 3
```

If the Settings section is omitted entirely, the orchestrator uses its own defaults (defined in its prompt — typically pass_threshold: 7, max_iterations: 3, but each agent sets its own). The orchestrator MUST always write the effective pass_threshold into goal.md so the evaluator knows the target — the evaluator has no access to the orchestrator's prompt.

### 3. Plan (Subagent)

Spawn a planner subagent that:
1. Reads `goal.md`
2. Reads `context/` for prior run data or cross-agent context
3. Reads `evolution/lessons.md` for accumulated experience
4. Produces `plan.md` with ordered steps, expected outputs, and risk flags

Planner prompt pattern:
```
Read {task_dir}/goal.md and {task_dir}/context/ for background.
Read {workdir}/evolution/lessons.md for past experience.
Write a plan to {task_dir}/plan.md with:
- Numbered steps with expected output per step
- Dependencies between steps
- Risk flags and mitigations
- Estimated complexity (low/medium/high)
```

### 4. Execute (Subagent)

Spawn worker subagent(s) that:
1. Read `plan.md`
2. Execute each step, writing artifacts to `work/`
3. Log progress inline in artifacts

Worker prompt pattern:
```
Read {task_dir}/plan.md. Execute each step.
Write all output artifacts to {task_dir}/work/.
If a step fails, document the failure and continue to next step.
Do not skip steps without documenting why.
```

For parallelizable work, spawn multiple workers — each writes to a named subdirectory under `work/`.

### 5. Evaluate (Subagent)

Spawn evaluator subagent that:
1. Reads `goal.md` — specifically the Evaluation Rubric section for scoring dimensions and weights
2. Reads `plan.md` (what was planned)
3. Reads `work/` (what was produced)
4. Reads previous `eval.md` if this is a retry (to avoid repeating feedback)
5. Scores each rubric dimension 1-10, computes weighted overall score
6. Writes `eval.md` with pass/fail verdict

Evaluator prompt pattern:
```
Read {task_dir}/goal.md — extract the Evaluation Rubric (dimensions, weights, criteria).
Read {task_dir}/plan.md for intended approach.
Read {task_dir}/work/ for actual output.
If {task_dir}/eval.md exists, read it — do not repeat prior feedback.
If {task_dir}/history/ exists, read all prior round eval.md and changelog.md files
to build a cumulative fixes checklist (see Plan Adherence below).

PLAN ADHERENCE CHECK (mandatory for every round):
1. Read plan.md and extract every numbered step and its expected output.
2. For each step, verify the corresponding output exists in work/.
   If a step has no output and no documented skip reason, flag it.
3. If plan.md contains a "Verification Checklist" section, evaluate every
   checklist item and report pass/fail per item in eval.md.
4. For rounds > 1: build a CUMULATIVE FIXES CHECKLIST from all prior rounds.
   Scan history/round-{1..N-1}/eval.md for every fix requested, and
   history/round-{1..N-1}/changelog.md for every fix applied.
   Verify each prior fix is STILL PRESENT in the current work/ output.
   If any prior fix has regressed, flag it as a regression and deduct from
   the relevant dimension. Regressions are scored more harshly than
   first-time misses (a fix that was applied and then lost is worse than
   one never applied).

For EACH dimension in the rubric:
- Score 1-10 based on the "What to check" criteria
- Provide 1-2 sentence justification

Compute overall score as weighted average (sum of score × weight).
If no weights specified, use equal weights.

Verdict rule: PASS only if EVERY dimension scores >= threshold.
If ANY single dimension scores below threshold, verdict is FAIL —
even if the weighted average exceeds the threshold.

Write {task_dir}/eval.md with:
- Plan Adherence Report:
  - Steps completed vs planned (e.g., "8/9 steps completed")
  - Verification Checklist results (if plan.md has one): pass/fail per item
  - Cumulative Fixes Status (rounds > 1): list every prior-round fix,
    whether it is still present (✓) or regressed (✗), with file/line ref
  - Any regressions flagged with "[REGRESSION]" tag
- Per-dimension scores, weights, whether each meets threshold, and justification
- Overall weighted score (informational only — verdict is per-dimension)
- List of dimensions below threshold (or "None")
- PASS or FAIL based on per-dimension rule above
- If FAIL: specific, actionable feedback for retry tied to below-threshold dimensions
```

### 6. Loop

After each evaluate step, the orchestrator:
1. Archives the current round: copy `plan.md`, `work/`, and `eval.md` into `history/round-{N}/`
2. Writes `history/round-{N}/changelog.md` summarizing what changed from the previous round (skip for round 1)
3. Updates `iterations.json` with the round's scores and changelog summary
4. Checks `eval.md`:
   - If PASS or max iterations reached → proceed to evolve step
   - If FAIL → copy eval feedback to `context/prev-eval.md`, re-run from Plan step

Changelog format (`history/round-{N}/changelog.md`):
```markdown
## Round {N} Changes (from Round {N-1})

### Eval Feedback Addressed
- {dimension}: {what the evaluator said} → {what changed}

### Plan Changes
- {what the planner changed and why}

### Output Changes
- {specific sections rewritten, data added, structure changed}

### Score Delta
| Dimension | Round {N-1} | Round {N} | Delta |
|-----------|-------------|-----------|-------|
| ...       | ...         | ...       | ...   |
```

`iterations.json` structure:
```json
{
  "task_id": "...",
  "goal": "...",
  "threshold": 9,
  "max_iterations": 10,
  "rubric_dimensions": ["Data Accuracy", "Format Compliance", "Coverage", "Clarity"],
  "iterations": [
    {
      "round": 1,
      "plan_summary": "...",
      "scores": {
        "Data Accuracy": {"score": 6, "weight": 0.3},
        "Format Compliance": {"score": 8, "weight": 0.2},
        "Coverage": {"score": 5, "weight": 0.3},
        "Clarity": {"score": 7, "weight": 0.2}
      },
      "overall": 6.3,
      "verdict": "FAIL",
      "dimensions_below_threshold": ["Data Accuracy", "Coverage", "Clarity"],
      "feedback_summary": "Coverage gaps in Risks quadrant; Data Accuracy needs source links",
      "changelog_summary": null
    },
    {
      "round": 2,
      "plan_summary": "...",
      "scores": {
        "Data Accuracy": {"score": 8, "weight": 0.3},
        "Format Compliance": {"score": 9, "weight": 0.2},
        "Coverage": {"score": 8, "weight": 0.3},
        "Clarity": {"score": 8, "weight": 0.2}
      },
      "overall": 8.2,
      "verdict": "FAIL",
      "dimensions_below_threshold": ["Data Accuracy"],
      "feedback_summary": "Data Accuracy still missing 2 source links in Background",
      "changelog_summary": "Added Risks quadrant content, linked 4 data sources to claims"
    }
  ]
}
```

### 7. Evolve

After task completion (pass or max iterations), run evolution:

1. Append to `evolution/experience-log.json`:
   ```json
   {
     "task_id": "...",
     "timestamp": "ISO-8601",
     "goal_summary": "...",
     "iterations_count": 2,
     "final_score": 8.5,
     "verdict": "PASS",
     "key_learnings": ["...", "..."],
     "skill_gaps": ["...", "..."]
   }
   ```

2. Curate `evolution/lessons.md`:
   - Check if new learnings duplicate existing lessons → merge
   - Add new actionable lessons (1-2 lines each, "Do X when Y" format)
   - If approaching 200 lines, retire least impactful entries
   - Group by category: Planning, Execution, Evaluation, Domain

3. If skill improvements identified, propose updates (don't auto-apply without user confirmation).

## Orchestrator Prompt Template

Use this as the base prompt for the major agent. Reference subagents by their dedicated agent names:

```
You are an ORCHESTRATOR ONLY. You do NOT research, write, or evaluate.
You ONLY coordinate subagents and manage the task loop.

Subagents:
- {planner-name}: Researches and plans the work
- {worker-name}: Executes the plan and produces artifacts
- {evaluator-name}: Scores output against the rubric in goal.md

CRITICAL RULES:
- You MUST delegate ALL research/data gathering to {planner-name}.
- You MUST delegate ALL content creation to {worker-name}.
- You MUST delegate ALL evaluation to {evaluator-name}.
- NEVER write to plan.md, work/, context/research.md, or eval.md yourself.
  Those are subagent outputs.
- Your ONLY writes are: goal.md, iterations.json, context/prev-eval.md (copying
  eval feedback), and evolution files.

Agent defaults (used when goal.md omits Settings section):
- pass_threshold: {set per agent, recommend 9 for quality-critical work}
- max_iterations: {set per agent, recommend 10 to allow thorough refinement}
When writing goal.md, include a Settings section ONLY if the user specifies
custom values. Otherwise omit it and these defaults apply.
Always write the effective pass_threshold into goal.md so the evaluator knows the target.

For each task:
1. If user provides an existing task_id (e.g., "resume blog-post-draft-a1b2c3d4"),
   resume it — see resume logic below. Otherwise generate new task_id:
   {slug}-{8char_hex_random} where slug is a short kebab-case name from the goal
2. Create task dir: {workdir}/tasks/{task_id}/ with work/, context/, and history/ subdirs
3. Write goal.md with the goal, acceptance criteria, and evaluation rubric
4. Spawn {planner-name}: 'Task dir: {workdir}/tasks/{task_id}. Read goal.md. Write plan.md.'
5. Verify plan.md exists. Spawn {worker-name}: 'Task dir: {workdir}/tasks/{task_id}. Read plan.md. Write to work/.'
6. Verify work output exists. Spawn {evaluator-name}: 'Task dir: {workdir}/tasks/{task_id}. Read goal.md for rubric. Evaluate work/. Write eval.md.'
7. Archive round: copy plan.md, work/, eval.md to history/round-{N}/. Write changelog.md.
8. Read eval.md. If FAIL and iterations < max: copy eval to context/prev-eval.md, loop from step 4
9. If PASS or max iterations reached: read final output and present to user, run evolution

Resume logic:
- Verify {workdir}/tasks/{task_id}/ exists
- Check files to determine resume point:
  eval.md with FAIL verdict → re-plan (step 4) with eval feedback in context/
  work/ has output but no eval.md → evaluate (step 6)
  plan.md exists but work/ empty → execute (step 5)
  Only goal.md → plan (step 4)

Refine logic (user gives feedback on a completed task):
- When the user sends a follow-up message after a task has PASSED (or reached
  max iterations), treat it as a refinement request on the SAME task.
- Write the user's feedback to context/prev-eval.md (same as eval feedback)
- Re-enter the loop from step 4 (plan) with the user feedback as context
- The planner and writer will read prev-eval.md and adjust accordingly
- Continue the iteration count from where it left off
- This is the DEFAULT behavior for any user message that follows a completed task.
  Do NOT start a new task unless the user explicitly asks for a different topic.

Always include the full task_dir path when spawning subagents.
Always read evolution/lessons.md before starting (if it exists).
After completion, append to evolution/experience-log.json and curate lessons.md.
```

## Agent Config Template

See [references/agent-schema.md](references/agent-schema.md) for the full Kiro agent JSON schema.

Orchestrator config (note: NO domain-specific MCP tools — only coordination tools):

```json
{
  "name": "{agent-name}",
  "description": "Orchestrator agent with plan→execute→evaluate loop",
  "prompt": "... (orchestrator prompt above with hard prohibitions) ...",
  "mcpServers": {},
  "tools": ["fs_read", "fs_write", "fs_list", "shell", "subagent"],
  "allowedTools": ["fs_read", "fs_write", "fs_list", "shell", "subagent"],
  "resources": ["skill://.kiro/skills/agent-harness/SKILL.md"],
  "toolsSettings": {
    "subagent": { "trustedAgents": ["{planner-name}", "{worker-name}", "{evaluator-name}"] },
    "shell": { "autoAllowReadonly": true, "deniedCommands": ["rm .*"] },
    "write": { "allowedPaths": ["{workdir}/**", ".kiro/data/**"] }
  }
}
```

## Subagent Design

Create dedicated custom agents for each role instead of using `default`. Each subagent gets its own config file with a focused prompt, minimum-privilege tools, and only the skills it needs.

### Why dedicated subagents

- `default` agent has no domain-specific prompt — it guesses what to do from the orchestrator's inline instructions
- Dedicated agents have their own system prompt, so they know their role without the orchestrator repeating instructions
- Tool access is scoped per role — the planner gets API access, the writer gets file-only, the evaluator gets read/write only
- Skills in `resources` are loaded into the subagent's context automatically — but the prompt should still explicitly tell the agent to read them

### Naming convention

Use `{domain}-{role}` pattern: `report-planner`, `report-writer`, `report-evaluator`.

### Subagent config patterns

Planner (needs API/data access):
```json
{
  "name": "{domain}-planner",
  "prompt": "You are a research and planning specialist for {domain}. Read goal.md, query data sources, write research to context/research.md and plan to plan.md.",
  "mcpServers": { "...": "..." },
  "tools": ["@server/tool-a", "fs_read", "fs_write", "fs_list"],
  "allowedTools": ["@server/tool-a", "fs_read", "fs_write", "fs_list"],
  "resources": ["skill://.kiro/skills/{data-skill}/SKILL.md"],
  "toolsSettings": { "write": { "allowedPaths": ["{workdir}/**"] } }
}
```

Worker (needs domain skills, usually no API access):
```json
{
  "name": "{domain}-worker",
  "prompt": "You are a {domain} specialist. Read plan.md and context/. Produce artifacts in work/. Read {skill-path} and apply its rules.",
  "mcpServers": {},
  "tools": ["fs_read", "fs_write", "fs_list"],
  "allowedTools": ["fs_read", "fs_write", "fs_list"],
  "resources": ["skill://.kiro/skills/{domain-skill}/SKILL.md", "skill://.kiro/skills/{writing-skill}/SKILL.md"],
  "toolsSettings": { "write": { "allowedPaths": ["{workdir}/**"] } }
}
```

Evaluator (read/write only, no API, no shell):
```json
{
  "name": "{domain}-evaluator",
  "prompt": "You are a quality evaluator for {domain}. Read goal.md for the rubric. Read work/ for output. Score each dimension 1-10. Write eval.md.",
  "mcpServers": {},
  "tools": ["fs_read", "fs_write", "fs_list"],
  "allowedTools": ["fs_read", "fs_write", "fs_list"],
  "resources": ["skill://.kiro/skills/{domain-skill}/SKILL.md"],
  "toolsSettings": { "write": { "allowedPaths": ["{workdir}/**"] } }
}
```

### Key principles

- **Least privilege**: Only give each subagent the tools it actually needs. Planner needs API access. Worker usually doesn't. Evaluator never does.
- **Orchestrator has NO domain tools**: The orchestrator must NOT have the same API/MCP tools as its subagents. If the orchestrator can query the data source, it will skip the planner and do it itself. Remove all domain-specific tools from the orchestrator — it only needs `subagent`, `fs_read`, `fs_write`, `fs_list`, and optionally `shell` for mkdir.
- **Hard prohibitions in orchestrator prompt**: Soft language like "spawn subagent to do X" gets ignored. Use explicit prohibitions: "You MUST delegate ALL research to {planner}. You do NOT have database access. NEVER write to plan.md yourself."
- **Verify before chaining**: After each subagent completes, the orchestrator should verify the expected output file exists before spawning the next subagent. E.g., check plan.md exists before spawning the writer.
- **Explicit skill references**: Listing a skill in `resources` loads it into context, but the subagent's prompt should still say "Read {skill-path} and apply its rules." This ensures the agent actually uses the skill rather than ignoring loaded context.
- **No shell for evaluator**: The evaluator should never execute code or commands — it only reads and scores.
- **Write paths scoped to workdir**: All subagents write only to `{workdir}/**`. No access to `.kiro/agents/`, `.kiro/skills/`, or other system paths.
- **Config staging**: Write agent configs to `.kiro/data/` first (write-path-guard may block `.kiro/agents/`), then copy to `.kiro/agents/` to activate.

## Cross-Agent Context Sharing

Agents share context through the task directory's `context/` folder:

- Before planning, copy relevant outputs from other agents' task dirs into `context/`
- Use filenames that indicate source: `context/{source-agent}_{task-id}_summary.md`
- Previous iteration eval feedback goes to `context/prev-eval.md`
- The orchestrator decides what context to surface — subagents should not reach outside their task dir

## Evaluation Rubric Design

The rubric is defined per-task in `goal.md`. When scaffolding a new agent, define a default rubric in the orchestrator prompt that fits the agent's domain. Individual tasks can override it.

### Rubric format

```markdown
## Evaluation Rubric
| Dimension | Weight | What to check |
|-----------|--------|---------------|
| {name}    | {0.0-1.0} | {specific criteria the evaluator checks} |
```

Weights must sum to 1.0. If omitted, evaluator uses equal weights across all dimensions.

### Rubric design guidelines

- 3-6 dimensions per rubric — fewer is better, each must be independently scorable
- Weights reflect what matters most for this task — put weight on what's hardest to get right
- "What to check" should be concrete and observable, not vague ("good quality")
- Include at least one dimension for correctness/accuracy — the evaluator can't improve what it can't measure
- For code-producing agents: consider dimensions like test coverage, type safety, no lint errors
- For data-producing agents: consider dimensions like source traceability, completeness, freshness
- For document-producing agents: consider dimensions like format compliance, clarity, audience fit
- Plan Adherence is enforced by the evaluator as a mandatory check (not a rubric dimension) — the evaluator verifies every plan step has output, checks verification checklists, and tracks cumulative fix regressions across rounds. This is separate from the rubric to avoid diluting domain-specific dimensions, but regressions and plan deviations deduct from the most relevant rubric dimension (e.g., Completeness, Structure, or Format).

### Example rubrics by domain

Game feature implementation (피카츄 배구):
```
| Dimension | Weight | What to check |
|-----------|--------|---------------|
| Gameplay Correctness | 0.30 | 물리 시뮬레이션(중력, 충돌, 반사)이 정확하고, 게임 규칙(점수, 라운드)이 올바르게 동작 |
| Rendering Quality | 0.20 | 스프라이트 애니메이션이 매끄럽고, Canvas 렌더링에 깨짐/깜빡임 없음, 60fps 유지 |
| Input Responsiveness | 0.15 | 키보드 입력이 즉시 반영되고, 동시 키 입력(대각선 이동+점프) 정상 동작 |
| Code Structure | 0.20 | 엔티티(피카츄, 공, 네트) 분리, 게임 루프와 렌더링 분리, 설정값 상수화 |
| Game Balance | 0.15 | 공 속도/중력/반발 계수가 적절하고, AI 난이도가 플레이 가능한 수준 |
```

Game UI/UX:
```
| Dimension | Weight | What to check |
|-----------|--------|---------------|
| Visual Consistency | 0.25 | 스프라이트 스타일 통일, 해상도 일관성, 픽셀 아트 선명도 유지 |
| User Flow | 0.25 | 메뉴→게임→결과 화면 전환이 자연스럽고, 상태 머신이 올바르게 동작 |
| Feedback | 0.25 | 점수 변경/라운드 전환/게임오버 시 시각적 피드백 존재 |
| Accessibility | 0.25 | 키보드만으로 전체 조작 가능, 게임 상태가 화면에 명확히 표시 |
```

Game performance optimization:
```
| Dimension | Weight | What to check |
|-----------|--------|---------------|
| Frame Rate | 0.30 | 60fps 안정 유지, requestAnimationFrame 올바르게 사용, 프레임 드롭 없음 |
| Memory Efficiency | 0.25 | 객체 풀링 적용, 가비지 컬렉션 부하 최소화, 메모리 누수 없음 |
| Asset Loading | 0.20 | 에셋 사전 로딩 완료 후 게임 시작, 로딩 상태 표시, 불필요한 리소스 없음 |
| Bundle Size | 0.25 | 프로덕션 빌드 최적화, 미사용 코드 제거, console.log 제거 |
```

## Conventions

- Task IDs: `{slug}-{8char_hex}` format — slug is kebab-case from goal (e.g., `blog-post-draft-a1b2c3d4`)
- To resume a task, user provides the task dir name — orchestrator detects progress and resumes from the right step
- All agent output goes to files, not inline in prompts (keeps context clean)
- Evaluator scores are integers 1-10 per rubric dimension; verdict requires every dimension to meet the threshold (not just the weighted average)
- Rubric is defined in goal.md per task; agent-level default rubric goes in orchestrator prompt
- pass_threshold and max_iterations: set agent defaults in orchestrator prompt, override per-task in goal.md Settings section. Verdict is per-dimension: every dimension must score >= threshold to PASS.
- Evolution lessons use imperative form: "Do X when Y", "Avoid X because Y"

## Lessons from Experience

Practical lessons learned from scaffolding and running harness agents (report-generator, code-reviewer).

### Scaffolding

- Do place workdirs under `.kiro/data/{agent-name}/` when write-path guards restrict access to other directories. The `.kiro/data/` path is typically always writable.
- Do write agent configs to `.kiro/agents/` directly when temp-approved, or stage in `.kiro/data/` and copy if blocked.
- Do seed `evolution/lessons.md` with domain-relevant starter lessons during scaffolding — the planner reads these from round 1.
- Do seed `evolution/experience-log.json` with an empty array `[]` so the orchestrator can append without checking existence.

### Orchestrator Prompt

- Do explicitly list each subagent's capabilities in the orchestrator prompt (e.g., "report-planner has database read access and API access"). The orchestrator can't inspect subagent configs at runtime — it only knows what its own prompt tells it.
- Do include hard prohibitions: "You do NOT have database access. You do NOT have API access." Soft language gets ignored — the orchestrator will try to do research itself if it has any ambiguity.
- Do update the spawn prompt to tell the planner to use its specific tools: "Search the database for context. Query the API for live data." Generic prompts like "analyze the data" lead to the planner ignoring its MCP tools.
- Do include the workdir path as a constant in the orchestrator prompt (e.g., `Workdir: .kiro/data/my-agent`) so it doesn't have to guess.

### Subagent Design

- Do give the planner all data-access MCP tools (database, API, etc.) and the worker/evaluator none. This enforces the research→produce→evaluate separation.
- Do use `@server/*` wildcard for MCP tool access in `tools` and `allowedTools` when you want all tools from a server (e.g., `@your-org.your-mcp-server/*`).
- Do add the data-source skill to the planner's `resources` when it has database access — the skill contains connection details and query patterns the planner needs.
- Do include data source identifiers directly in the planner's prompt for the sources it should search. The planner won't discover them on its own.
- Avoid giving the evaluator `shell` access — it should only read and score, never execute.
- Avoid giving the orchestrator any MCP servers. If it can query the database or API, it will bypass the planner.

### Rubric Design

- Do design rubrics with 3-6 dimensions. More than 6 dilutes evaluator focus.
- Do include a math/accuracy dimension for any agent that produces numerical output (cost estimates, metrics, calculations). The evaluator should spot-check arithmetic.
- Do weight the hardest-to-get-right dimension highest — that's where iteration loops add the most value.

### Plan Adherence & Regression Prevention

- Do instruct the evaluator to check every numbered plan step against work/ output. Silent drops are worse than documented skips.
- Do instruct the planner to include a "Verification Checklist" in plan.md for rounds > 1. The evaluator uses this as a machine-readable scoring input.
- Do instruct the evaluator to build a cumulative fixes checklist from all prior history/round-*/eval.md and changelog.md files. A fix that was applied in round N and regressed in round N+1 should be scored more harshly than a first-time miss.
- Avoid relying solely on prev-eval.md for continuity — it only carries the most recent round's feedback. The evaluator must scan the full history/ directory to catch regressions from any prior round.

### Write Path Guards

- When a preToolUse hook restricts write paths, check the allowed list before writing. Adjust the workdir to an allowed path rather than fighting the guard.
- The pattern `.kiro/data/**` is a safe default for agent workdirs when other paths are restricted.
