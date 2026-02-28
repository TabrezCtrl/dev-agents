# Dev Agents — Claude Code Plugin

A team of 7 specialized development agents for Claude Code. Each agent focuses on a specific phase of the development workflow and can work in parallel when tasks are independent.

## Agents

| Command | Agent | Role |
|---------|-------|------|
| `/plan` | Planning Agent | Architecture, feature planning, task breakdown |
| `/code` | Coding Agent | Clean production code following codebase patterns |
| `/design` | Design Agent | UI/UX, accessibility, responsive design |
| `/debug` | Debug Agent | Systematic root cause analysis |
| `/test` | Testing Agent | Comprehensive tests following project conventions |
| `/quality` | Quality Agent | Code review — correctness, security, performance |
| `/brainstorm` | Brainstorm Agent | Idea generation, option evaluation |

## Workflow Chains

Chain agents for full feature development:

```
/plan → /code → /test → /quality
```

Agents automatically run in parallel when their work is independent — for example, `/test` and `/quality` can run simultaneously after `/code` completes.

## Installation

### From GitHub

```bash
claude plugin add <github-username>/dev-agents
```

### Manual

Clone this repo into your Claude Code plugins directory:

```bash
git clone https://github.com/<github-username>/dev-agents.git ~/.claude/plugins/dev-agents
```

## Usage

Invoke any agent with its slash command:

```
/plan Add user authentication with OAuth2
/code Implement the login form component
/design Review the dashboard layout for accessibility
/debug The API returns 500 on POST /users
/test Write tests for the auth middleware
/quality Review the changes in src/auth/
/brainstorm How should we handle real-time notifications?
```

## Structure

```
dev-agents/
├── .claude-plugin/
│   └── plugin.json          # Plugin metadata
├── agents/                   # Subagent definitions (auto-dispatched)
│   ├── planning-agent.md
│   ├── coding-agent.md
│   ├── design-agent.md
│   ├── debug-agent.md
│   ├── testing-agent.md
│   ├── quality-agent.md
│   └── brainstorm-agent.md
├── commands/                 # Slash command definitions
│   ├── plan.md
│   ├── code.md
│   ├── design.md
│   ├── debug.md
│   ├── test.md
│   ├── quality.md
│   └── brainstorm.md
└── README.md
```

## License

MIT
