# Dev Agents — Claude Code Plugin

A team of 10 specialized development agents for Claude Code. Each agent focuses on a specific phase of the development workflow and can work in parallel when tasks are independent.

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
| `/security` | Security Agent | Deep security auditing, threat modeling, vulnerability analysis |
| `/best-practices` | Best Practices Agent | SOLID, clean architecture, industry standards |
| `/review` | Review Orchestrator | Multi-agent code review with confidence scoring |

## Workflow Chains

Chain agents for full feature development:

```
/plan → /code → /test → /quality
```

Or run a comprehensive review:

```
/review   (launches 5 parallel sub-agents with confidence scoring)
```

Agents automatically run in parallel when their work is independent — for example, `/test` and `/quality` can run simultaneously after `/code` completes.

## The `/review` Pipeline

The review orchestrator runs a multi-agent pipeline:

1. **Scope** — Identifies changed files via `git diff`
2. **Load Guidelines** — Haiku agent reads CLAUDE.md, .cursorrules, .coderabbit.yaml, etc.
3. **5 Parallel Reviewers** (Sonnet) — Guideline compliance, best practices, DRY/abstraction, security, error handling/performance/naming
4. **Confidence Scoring** — Parallel Haiku agents score each issue 0-100
5. **Filter** — Only issues scoring >= 80 make the final report
6. **Report** — Severity-ranked findings with file:line references and fixes

## Installation

### From GitHub

```bash
claude plugin add TabrezCtrl/dev-agents
```

### Manual

Clone this repo into your Claude Code plugins directory:

```bash
git clone https://github.com/TabrezCtrl/dev-agents.git ~/.claude/plugins/dev-agents
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
/security Audit the authentication flow
/best-practices Check the API layer for SOLID violations
/review Review all staged changes
```

## Structure

```
dev-agents/
├── .claude-plugin/
│   └── plugin.json              # Plugin metadata
├── agents/                       # Subagent definitions (auto-dispatched)
│   ├── planning-agent.md
│   ├── coding-agent.md
│   ├── design-agent.md
│   ├── debug-agent.md
│   ├── testing-agent.md
│   ├── quality-agent.md
│   ├── brainstorm-agent.md
│   ├── security-agent.md
│   ├── best-practices-agent.md
│   └── review-agent.md
├── commands/                     # Slash command definitions
│   ├── plan.md
│   ├── code.md
│   ├── design.md
│   ├── debug.md
│   ├── test.md
│   ├── quality.md
│   ├── brainstorm.md
│   ├── security.md
│   ├── best-practices.md
│   └── review.md
└── README.md
```

## License

MIT
