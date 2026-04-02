# Kiro Agent JSON Schema Reference

## File Location

Agent configs live at `.kiro/agents/{name}.json`.

## Valid Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | yes | Agent identifier (used in subagent calls) |
| `description` | string | yes | What the agent does |
| `prompt` | string | yes | System prompt for the agent |
| `mcpServers` | object | no | MCP server connections |
| `tools` | string[] | yes | Available tools (use `["*"]` for all) |
| `toolAliases` | object | no | Tool name aliases |
| `allowedTools` | string[] | no | Auto-approved tools (no confirmation prompt) |
| `resources` | string[] | no | Skill references (`skill://.kiro/skills/{name}/SKILL.md`) |
| `hooks` | object | no | Agent-specific hooks |
| `toolsSettings` | object | no | Granular access control |
| `includeMcpJson` | boolean | no | Include workspace MCP config |
| `useLegacyMcpJson` | boolean | no | Use legacy MCP format |
| `model` | string | no | Model override |
| `keyboardShortcut` | string | no | Keyboard shortcut to invoke |
| `welcomeMessage` | string | no | Displayed when agent starts |

Any field not in this list causes a JSON validation error.

## Built-in Tool Names (CLI)

| CLI Name | What it does |
|----------|-------------|
| `fs_read` | Read files |
| `fs_write` | Write/append files |
| `fs_list` | List directory contents |
| `shell` | Execute shell commands |
| `subagent` | Spawn subagents |

MCP tools: `@server-name/tool-name`

## toolsSettings

### shell
```json
{
  "shell": {
    "autoAllowReadonly": true,
    "allowedCommands": ["node .*", "python3 .*"],
    "deniedCommands": ["rm .*", "mv .*", "chmod .*", "git push .*"]
  }
}
```

### write
```json
{
  "write": {
    "allowedPaths": ["output/**", ".kiro/data/**"]
  }
}
```

### read
```json
{
  "read": {
    "allowedPaths": ["./src/**"],
    "deniedPaths": ["secrets/**", ".env"]
  }
}
```

### subagent
```json
{
  "subagent": {
    "trustedAgents": ["planner", "worker", "evaluator", "default"]
  }
}
```

Include `"default"` to trust the Kiro default agent.

## tools vs allowedTools

- `tools`: which tools are available. Each requires manual approval unless also in `allowedTools`.
- `allowedTools`: auto-approved (no y/n prompt).
- For hands-free operation, list the same tools in both.

## Hooks Schema

```json
{
  "hook-id": {
    "name": "Hook Name",
    "description": "What it does",
    "version": "1",
    "when": {
      "type": "agentStop | preToolUse | postToolUse | fileEdited | ...",
      "toolTypes": ["write"],
      "patterns": ["*.ts"]
    },
    "then": {
      "type": "askAgent | runCommand",
      "prompt": "...",
      "command": "..."
    }
  }
}
```

## Common Pitfalls

1. IDE tool names (`readFile`, `fsWrite`, `executeBash`) don't work in CLI — use `fs_read`, `fs_write`, `shell`.
2. `tools: ["*"]` without `allowedTools` — every call requires manual approval.
3. Missing `"default"` in `trustedAgents` — default agent prompts for approval.
4. Missing `autoAllowReadonly: true` — read-only commands like `ls` prompt for approval.
5. Prompt-level restrictions are soft guardrails — use `toolsSettings` for enforcement.
