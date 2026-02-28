const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

const PORT = 41730;
const PLUGIN_DIR = path.resolve(__dirname, '..');
const COMMANDS_DIR = path.join(PLUGIN_DIR, 'commands');
const AGENTS_DIR = path.join(PLUGIN_DIR, 'agents');

// --- YAML Frontmatter Parser ---

function parseFrontmatter(content) {
  const lines = content.split('\n');
  if (lines[0].trim() !== '---') return { meta: {}, body: content };

  let endIndex = -1;
  for (let i = 1; i < lines.length; i++) {
    if (lines[i].trim() === '---') { endIndex = i; break; }
  }
  if (endIndex === -1) return { meta: {}, body: content };

  const yamlLines = lines.slice(1, endIndex);
  const body = lines.slice(endIndex + 1).join('\n').replace(/^\n+/, '');
  const meta = {};
  let currentKey = null;
  let multiLineValue = '';
  let inMultiLine = false;
  let inArray = false;
  let arrayValues = [];

  for (const line of yamlLines) {
    if (inArray) {
      if (/^\s+-\s+/.test(line)) {
        arrayValues.push(line.replace(/^\s+-\s+/, '').trim());
        continue;
      } else {
        meta[currentKey] = arrayValues;
        inArray = false;
        arrayValues = [];
        currentKey = null;
      }
    }

    if (inMultiLine) {
      if (/^\s+/.test(line) && !/^\S/.test(line)) {
        multiLineValue += (multiLineValue ? ' ' : '') + line.trim();
        continue;
      } else {
        meta[currentKey] = multiLineValue;
        inMultiLine = false;
        multiLineValue = '';
        currentKey = null;
      }
    }

    const match = line.match(/^([\w][\w-]*)\s*:\s*(.*)/);
    if (match) {
      currentKey = match[1];
      const val = match[2].trim();
      if (val === '>') {
        inMultiLine = true;
        multiLineValue = '';
      } else if (val === '') {
        inArray = true;
        arrayValues = [];
      } else if (val === 'true') {
        meta[currentKey] = true;
        currentKey = null;
      } else if (val === 'false') {
        meta[currentKey] = false;
        currentKey = null;
      } else {
        meta[currentKey] = val;
        currentKey = null;
      }
    }
  }

  if (inArray) meta[currentKey] = arrayValues;
  if (inMultiLine && currentKey) meta[currentKey] = multiLineValue;

  return { meta, body };
}

function serializeFrontmatter(meta, body) {
  let yaml = '---\n';
  for (const [key, value] of Object.entries(meta)) {
    if (value === undefined || value === null) continue;
    if (Array.isArray(value)) {
      yaml += `${key}:\n`;
      value.forEach(v => { yaml += `  - ${v}\n`; });
    } else if (typeof value === 'string' && (value.length > 80 || value.includes('\n'))) {
      yaml += `${key}: >\n  ${value.replace(/\n/g, '\n  ')}\n`;
    } else if (typeof value === 'boolean') {
      yaml += `${key}: ${value}\n`;
    } else {
      yaml += `${key}: ${value}\n`;
    }
  }
  yaml += '---\n\n';
  return yaml + body;
}

// --- Agent Scanning ---

function readMdFiles(dir) {
  return fs.readdirSync(dir)
    .filter(f => f.endsWith('.md') && f !== 'dashboard.md')
    .map(f => {
      const content = fs.readFileSync(path.join(dir, f), 'utf8');
      const { meta, body } = parseFrontmatter(content);
      return { filename: f, meta, body };
    });
}

function scanAgents() {
  const commands = readMdFiles(COMMANDS_DIR);
  const agents = readMdFiles(AGENTS_DIR);
  const paired = [];
  const usedAgents = new Set();

  for (const cmd of commands) {
    const id = cmd.meta.name || cmd.filename.replace('.md', '');
    let agent = agents.find(a => a.filename === `${id}-agent.md`);
    if (agent) {
      usedAgents.add(agent.filename);
    } else {
      agent = agents.find(a =>
        !usedAgents.has(a.filename) &&
        (a.meta.name || '').replace('-agent', '').startsWith(id.slice(0, 3))
      );
      if (agent) usedAgents.add(agent.filename);
    }

    paired.push({
      id,
      command: { filename: cmd.filename, meta: cmd.meta, body: cmd.body },
      agent: agent ? { filename: agent.filename, meta: agent.meta, body: agent.body } : null,
    });
  }

  return paired;
}

function findPair(id) {
  return scanAgents().find(a => a.id === id) || null;
}

// --- Claude CLI ---

function runClaude(prompt) {
  return new Promise((resolve, reject) => {
    let stdout = '';
    let stderr = '';

    // Remove CLAUDECODE env var to avoid nested session error
    const env = { ...process.env };
    delete env.CLAUDECODE;

    const proc = spawn('claude', ['-p', prompt, '--model', 'haiku', '--no-session-persistence', '--tools', ''], {
      stdio: ['pipe', 'pipe', 'pipe'],
      timeout: 120000,
      env,
    });

    proc.stdout.on('data', (chunk) => { stdout += chunk.toString(); });
    proc.stderr.on('data', (chunk) => { stderr += chunk.toString(); });

    proc.on('close', (code) => {
      if (code === 0) {
        resolve(stdout.trim());
      } else {
        reject(new Error(stderr.trim() || `claude exited with code ${code}`));
      }
    });

    proc.on('error', (err) => {
      if (err.code === 'ENOENT') {
        reject(new Error('claude CLI not found. Install it first: npm install -g @anthropic-ai/claude-code'));
      } else {
        reject(err);
      }
    });
  });
}

// --- HTTP Server ---

function readBody(req) {
  return new Promise((resolve) => {
    let data = '';
    req.on('data', chunk => { data += chunk; });
    req.on('end', () => resolve(data));
  });
}

function json(res, data, status = 200) {
  res.writeHead(status, {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const method = req.method;

  if (method === 'OPTIONS') {
    res.writeHead(204, {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    });
    return res.end();
  }

  // List agents
  if (method === 'GET' && url.pathname === '/api/agents') {
    return json(res, scanAgents());
  }

  // Single agent
  const singleMatch = url.pathname.match(/^\/api\/agents\/([^/]+)$/);
  if (method === 'GET' && singleMatch) {
    const pair = findPair(singleMatch[1]);
    return pair ? json(res, pair) : json(res, { error: 'Not found' }, 404);
  }

  // Toggle
  const toggleMatch = url.pathname.match(/^\/api\/agents\/([^/]+)\/toggle$/);
  if (method === 'PATCH' && toggleMatch) {
    const pair = findPair(toggleMatch[1]);
    if (!pair) return json(res, { error: 'Not found' }, 404);

    const disabled = !pair.command.meta.disabled;

    pair.command.meta.disabled = disabled || undefined;
    if (disabled) {
      pair.command.meta['user-invocable'] = false;
    } else {
      pair.command.meta['user-invocable'] = true;
      delete pair.command.meta.disabled;
    }
    fs.writeFileSync(path.join(COMMANDS_DIR, pair.command.filename),
      serializeFrontmatter(pair.command.meta, pair.command.body));

    if (pair.agent) {
      if (disabled) pair.agent.meta.disabled = true;
      else delete pair.agent.meta.disabled;
      fs.writeFileSync(path.join(AGENTS_DIR, pair.agent.filename),
        serializeFrontmatter(pair.agent.meta, pair.agent.body));
    }

    return json(res, { ok: true, disabled });
  }

  // Create
  if (method === 'POST' && url.pathname === '/api/agents') {
    const data = JSON.parse(await readBody(req));
    const cmdPath = path.join(COMMANDS_DIR, `${data.id}.md`);
    const agentPath = path.join(AGENTS_DIR, `${data.id}-agent.md`);

    if (fs.existsSync(cmdPath)) return json(res, { error: 'Agent already exists' }, 409);

    fs.writeFileSync(cmdPath, serializeFrontmatter(data.command.meta, data.command.body));
    fs.writeFileSync(agentPath, serializeFrontmatter(data.agent.meta, data.agent.body));
    return json(res, { ok: true, id: data.id }, 201);
  }

  // Update
  if (method === 'PUT' && singleMatch) {
    const pair = findPair(singleMatch[1]);
    if (!pair) return json(res, { error: 'Not found' }, 404);

    const data = JSON.parse(await readBody(req));
    fs.writeFileSync(path.join(COMMANDS_DIR, pair.command.filename),
      serializeFrontmatter(data.command.meta, data.command.body));

    if (pair.agent) {
      fs.writeFileSync(path.join(AGENTS_DIR, pair.agent.filename),
        serializeFrontmatter(data.agent.meta, data.agent.body));
    }

    return json(res, { ok: true });
  }

  // Delete
  if (method === 'DELETE' && singleMatch) {
    const pair = findPair(singleMatch[1]);
    if (!pair) return json(res, { error: 'Not found' }, 404);

    fs.unlinkSync(path.join(COMMANDS_DIR, pair.command.filename));
    if (pair.agent) fs.unlinkSync(path.join(AGENTS_DIR, pair.agent.filename));
    return json(res, { ok: true });
  }

  // AI Enhance via Claude CLI
  if (method === 'POST' && url.pathname === '/api/enhance') {
    const data = JSON.parse(await readBody(req));
    const { mode, input, currentPrompt, type } = data;
    // mode: 'enhance' | 'modify'
    // type: 'command' | 'agent'
    // input: user's raw text or modification instruction
    // currentPrompt: existing prompt (for modify mode)

    let cliPrompt = '';

    if (mode === 'enhance') {
      if (type === 'command') {
        cliPrompt = `You are a prompt engineer for Claude Code plugins. Given the following raw input from a user, generate a well-structured Claude Code slash command body in markdown.

The command body should follow this exact structure:
- # Title Activated
- "You are now operating as a **Role**."
- ## Role (1-2 sentences)
- ## Expertise (4-6 bullet points)
- ## Approach (numbered steps, 4-7 steps)
- ## Output Format (how to structure responses)
- ## Constraints (what NOT to do, read-only rules if applicable)
- ## Tools (Prefer: ... / Avoid: ...)
- End with $ARGUMENTS

User's raw input:
${input}

Generate ONLY the markdown body. No frontmatter, no explanation.`;
      } else {
        cliPrompt = `You are a prompt engineer for Claude Code plugins. Given the following raw input from a user, generate a concise agent body for a Claude Code subagent definition.

The agent body should be:
- First line: "You are a [Role]. [One sentence about what they do]."
- Then 5-6 bullet points with key instructions/principles
- Keep it concise — agents get minimal instructions, the command body has the detail

User's raw input:
${input}

Generate ONLY the agent body. No frontmatter, no explanation.`;
      }
    } else if (mode === 'modify') {
      cliPrompt = `You are a prompt engineer for Claude Code plugins. The user wants to modify an existing prompt.

Current prompt:
---
${currentPrompt}
---

User's modification request:
${input}

Apply the requested modification to the prompt. Keep the overall structure and format intact. Only change what the user asked for.

Return ONLY the full modified prompt. No explanation, no frontmatter.`;
    }

    try {
      const result = await runClaude(cliPrompt);
      return json(res, { ok: true, result });
    } catch (err) {
      return json(res, { error: err.message || 'Claude CLI failed' }, 500);
    }
  }

  json(res, { error: 'Not found' }, 404);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} already in use. Dashboard API may already be running.`);
  } else {
    console.error(err);
  }
  process.exit(1);
});

server.listen(PORT, () => {
  console.log(`Dev Agents API running at http://localhost:${PORT}`);
});
