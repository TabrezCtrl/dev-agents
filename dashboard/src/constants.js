export const COLOR_MAP = {
  blue: '#3b82f6',
  green: '#22c55e',
  purple: '#a855f7',
  red: '#ef4444',
  yellow: '#eab308',
  cyan: '#06b6d4',
  magenta: '#ec4899',
  orange: '#f97316',
  teal: '#14b8a6',
  white: '#f1f5f9',
};

export const ALL_COLORS = Object.keys(COLOR_MAP);

export const ALL_TOOLS = [
  'Read', 'Edit', 'Write', 'Glob', 'Grep', 'Bash', 'Task', 'WebSearch', 'WebFetch',
];

export function agentColor(name) {
  return COLOR_MAP[name] || name || '#666';
}

export function getDescription(agent) {
  if (!agent.command) return '';
  const d = agent.command.meta.description || '';
  return d.replace(/^Activate the [\w-]+ agent\s*[—–-]\s*/i, '');
}
