# Evolution Patterns Reference

How the harness learns from experience and improves over time.

## Experience Log Schema

File: `{workdir}/evolution/experience-log.json`

```json
{
  "version": 1,
  "entries": [
    {
      "task_id": "20260326-143000",
      "timestamp": "2026-03-26T14:35:00Z",
      "goal_summary": "Generate quarterly summary from project data",
      "iterations_count": 2,
      "final_score": 8.5,
      "verdict": "PASS",
      "key_learnings": [
        "API pagination needed for >100 results",
        "Date filters must use ISO-8601 format"
      ],
      "skill_gaps": [
        "No guidance on handling rate limits"
      ],
      "duration_estimate": "~5 min",
      "failure_modes": ["First iteration missed pagination"]
    }
  ]
}
```

## Lessons File Format

File: `{workdir}/evolution/lessons.md`

```markdown
# Agent Lessons Learned
<!-- Managed by harness evolution. Target: <200 lines. Last updated: YYYY-MM-DD -->

## Planning
- Always check for pagination when querying APIs with >100 potential results.
- Break file-generation tasks into validate→generate→verify steps.

## Execution
- Write intermediate outputs to work/ even for single-step tasks — aids debugging.
- When a step fails, capture the error message in work/errors.md before continuing.

## Evaluation
- Evaluator should re-read goal.md each iteration — don't rely on cached understanding.
- Score "completeness" strictly against acceptance criteria, not general quality.

## Domain
- (Domain-specific lessons go here, grouped by topic)
```

## Curation Rules

1. Lessons must be actionable: "Do X when Y" or "Avoid X because Y".
2. Max 1-2 lines per lesson.
3. Before adding, check for duplicates or near-duplicates → merge.
4. When approaching 200 lines, retire least impactful entries.
5. Group by category: Planning, Execution, Evaluation, Domain.
6. Update the `Last updated` date after any change.

## Evolution Triggers

| Trigger | Action |
|---------|--------|
| Task completes (pass) | Append to experience-log, curate lessons |
| Task completes (fail at max iterations) | Append to experience-log, curate lessons, flag skill gaps |
| Score improved between iterations | Log what changed in plan that helped |
| Score decreased between iterations | Log what changed that hurt |
| User corrects agent output | High-priority lesson candidate |

## Checking Evolution History

Before evolving, always read the existing experience-log to:
- Avoid logging duplicate learnings
- Identify recurring failure patterns (same skill gap appearing 3+ times → propose skill update)
- Track improvement trends (are scores improving over time?)

## Skill Gap → Skill Update Pipeline

When a skill gap appears 3+ times in experience-log:
1. Aggregate the related entries
2. Draft a proposed skill update (specific file + change)
3. Present to user for confirmation
4. If approved, apply and log as "skill-update" in experience-log
5. Mark the gap entries as "addressed"
