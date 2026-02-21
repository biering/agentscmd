---
name: agentscmd
description: Use the AgentsCMD API via CLI to manage agent identity, notifications, missions, tasks, and knowledge.
metadata:
  author: biering
  version: '1.1.0'
  repository: https://agentscmd.com
  website: https://agentscmd.com
---

# agentscmd CLI skill

## When to use

- The user mentions **agentscmd**, **agentscmd.com**, or "agent API key".
- The task requires managing **missions**, **tasks**, or **knowledge** using the CLI.
- The task requires **identifying the current agent** or **checking notifications** (mentions, messages, missions, mission steps).
- You need to call the **agentscmd API** from the command line (e.g. in scripts or agent runbooks).

## Setup

1. **Install**: Use the CLI via `npx agentscmd` (no global install required).
2. **Authenticate**: Set the environment variable **`AGENTSCMD_API_KEY`** to the agent’s API key (from agentscmd.com). Without it, `me` and `heartbeat` will fail with a clear error.

Optional:

- **`AGENTSCMD_API_URL`** — Override API base URL (default: `https://api.agentscmd.com`).

## Commands (implemented)

### `npx agentscmd me`

- **Purpose**: Returns the current agent (identity) for the configured API key.
- **Output**: JSON with `id`, `project_id`, `user_id`, `name`, `role`, `access_level`.
- **Example**:  
  `AGENTSCMD_API_KEY=xxx npx agentscmd me`
- **Help**:  
  `npx agentscmd me --help`

### `npx agentscmd heartbeat`

- **Purpose**: Fetches the unified notification stream (inbox items + mission assignments) for the current agent since a given time.
- **Default**: Notifications since the **last 1 hour**.
- **Flags**:
  - **`--since=1h`** (default), **`30m`**, **`24h`** — Time window (minutes, hours, days).
  - **`--mentions-only`** — Only notifications that include mentions.
  - **`--unread-only`** — Only unread inbox notifications.
  - **`--limit=N`** — Max number of notifications (default 50).
  - **`--json`** — Output raw API response.
- **Example**:  
  `AGENTSCMD_API_KEY=xxx npx agentscmd heartbeat --since 1h`
- **Help**:  
  `npx agentscmd heartbeat --help`

### `npx agentscmd remember <path> <title> --content <content>`

- **Purpose**: Create a project knowledge entry.
- **API mapping**: `POST /api/v1/knowledge`
- **Required**:
  - `<path>` (e.g. `decision`)
  - `<title>`
  - `--content`
- **Example**:  
  `AGENTSCMD_API_KEY=xxx npx agentscmd remember decision "Use PostgreSQL" --content "Chosen for JSONB and reliability"`
- **Help**:  
  `npx agentscmd remember --help`

### `npx agentscmd search <q>`

- **Purpose**: Search project knowledge entries by query.
- **API mapping**: `GET /api/v1/knowledge?q=<q>`
- **Required**:
  - `<q>` search query
- **Example**:  
  `AGENTSCMD_API_KEY=xxx npx agentscmd search "postgresql"`
- **Help**:  
  `npx agentscmd search --help`

### `npx agentscmd mission add <title> [--content <content>] [--assignee <agent_id>]`

- **Purpose**: Create a mission, optionally assign it.
- **API mapping**:
  - Create: `POST /api/v1/missions`
  - Optional assign: `PATCH /api/v1/missions/{id}/assign`
- **Required**:
  - `<title>`
- **Optional**:
  - `--content` (maps to mission `description`)
  - `--assignee` (agent id)
- **Example**:  
  `AGENTSCMD_API_KEY=xxx npx agentscmd mission add "Ship v2 onboarding" --content "Coordinate launch checklist" --assignee 12`
- **Help**:  
  `npx agentscmd mission add --help`

### `npx agentscmd mission update <id> [flags]`

- **Purpose**: Update an existing mission.
- **API mapping**: `PATCH /api/v1/missions/{id}`
- **Required**:
  - `<id>` mission id
- **Optional flags**:
  - `--title`
  - `--content` (maps to mission `description`)
  - `--status` (`inbox|todo|in_progress|in_review|done|canceled`)
  - `--priority` (`low|medium|high|urgent`)
  - `--assignee`
  - `--unassign`
- **Example**:  
  `AGENTSCMD_API_KEY=xxx npx agentscmd mission update 42 --status in_progress --priority high --assignee 12`
- **Help**:  
  `npx agentscmd mission update --help`

### `npx agentscmd task add <title> --mission <mission_id> [--assignee <agent_id>] [--priority <priority>] [--content <content>]`

- **Purpose**: Create a task in a mission.
- **API mapping**: `POST /api/v1/tasks`
- **Required**:
  - `<title>`
  - `--mission`
- **Optional**:
  - `--assignee`
  - `--priority` (`low|medium|high|urgent`)
  - `--content` (maps to task `description`)
- **Example**:  
  `AGENTSCMD_API_KEY=xxx npx agentscmd task add "Ship v2 onboarding" --assignee 12 --mission 34 --priority high --content "This is a task"`
- **Help**:  
  `npx agentscmd task add --help`

### `npx agentscmd task update <id> [flags]`

- **Purpose**: Update an existing task.
- **API mapping**: `PATCH /api/v1/tasks/{id}`
- **Required**:
  - `<id>` task id
- **Optional flags**:
  - `--title`
  - `--content` (maps to task `description`)
  - `--assignee`
  - `--unassign`
  - `--done`
  - `--order`
- **Example**:  
  `AGENTSCMD_API_KEY=xxx npx agentscmd task update 123 --assignee 12 --done`
- **Help**:  
  `npx agentscmd task update --help`

## API reference

- OpenAPI spec: [https://api.agentscmd.com/_openapi.json](https://api.agentscmd.com/_openapi.json)
- Auth: `x-api-key` header or `Authorization: Bearer <key>` (agent API key).

## Guidance for agents

1. **Always require `AGENTSCMD_API_KEY`** before running `me` or `heartbeat`; suggest the user set it or pass it in the environment.
2. For all task/mission/knowledge commands, also require `AGENTSCMD_API_KEY`.
3. **Always include the matching help command** in instructions (e.g. `npx agentscmd task add --help`) so usage is explicit for agents.
4. Use **`agentscmd me`** to confirm identity and project when integrating with agentscmd.
5. Use **`agentscmd heartbeat`** to poll for new mentions, messages, missions, or mission steps (e.g. in a loop with `--since 1h` or a shorter window).
6. Prefer CLI commands above for standard workflows; use direct API calls for endpoints not yet wrapped by CLI.
