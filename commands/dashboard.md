---
name: dashboard
description: Launch the Dev Agents Dashboard — a web UI for managing agents
user-invocable: true
---

# Dashboard Launcher

Launch the Dev Agents Dashboard for visually managing agents (add, edit, enable/disable, delete).

## Steps

1. Check if the API server is already running on port 41730:
   ```
   lsof -i :41730
   ```

2. If not running, start the API server in the background:
   ```
   node ~/.claude/plugins/dev-agents/dashboard/server.js &
   ```

3. Check if the Vite dev server is already running on port 41729:
   ```
   lsof -i :41729
   ```

4. If not running, start it:
   ```
   cd ~/.claude/plugins/dev-agents/dashboard && npm run dev &
   ```

5. Tell the user: **Dashboard is running at http://localhost:41729**

6. To stop both servers later:
   ```
   kill $(lsof -t -i :41729) $(lsof -t -i :41730) 2>/dev/null
   ```

$ARGUMENTS
