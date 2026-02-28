import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createAgent } from '../api';
import { useAgents } from '../App';
import { ALL_COLORS, ALL_TOOLS, COLOR_MAP } from '../constants';
import PromptModal from './PromptModal';
import { ArrowLeft, Plus, Cpu, Palette, Wrench, FileText, Bot, Sparkles, X } from 'lucide-react';

export default function AddView() {
  const { reload, notify } = useAgents();
  const navigate = useNavigate();

  const [name, setName] = useState('');
  const [agentName, setAgentName] = useState('');
  const [cmdDesc, setCmdDesc] = useState('');
  const [model, setModel] = useState('sonnet');
  const [color, setColor] = useState('');
  const [agentDesc, setAgentDesc] = useState('');
  const [tools, setTools] = useState(['Read', 'Glob', 'Grep']);
  const [cmdBody, setCmdBody] = useState('');
  const [agentBody, setAgentBody] = useState('');
  const [promptModal, setPromptModal] = useState(null);

  function toggleTool(tool) {
    setTools((prev) => prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]);
  }

  function onNameChange(val) {
    const slug = val.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    setName(slug);
    setAgentName(`${slug}-agent`);
  }

  async function onCreate() {
    const id = name.trim();
    if (!id) return notify('Name is required', true);

    const data = {
      id,
      command: {
        meta: { name: id, description: cmdDesc || `Activate the ${id} agent`, 'user-invocable': true },
        body: cmdBody || `# ${id.charAt(0).toUpperCase() + id.slice(1)} Agent Activated\n\n$ARGUMENTS`,
      },
      agent: {
        meta: {
          name: agentName || `${id}-agent`,
          description: agentDesc || `Specialized agent for ${id} tasks.`,
          model, color: color || 'blue', tools,
        },
        body: agentBody || `You are a specialized agent.\n\n- Follow instructions carefully`,
      },
    };

    const res = await createAgent(data);
    if (res.error) return notify(res.error, true);
    await reload();
    navigate(`/agents/${id}`);
    notify(`Created /${id}`);
  }

  return (
    <>
      <button onClick={() => navigate('/')} style={backBtn}>
        <ArrowLeft size={14} /> Back to Grid
      </button>

      <div style={header}>
        <h2 style={headerTitle}><Bot size={20} /> New Agent</h2>
      </div>

      <div style={formGrid}>
        <div style={formGroup}>
          <label style={label}><FileText size={10} /> Command Name (slug)</label>
          <input style={input} placeholder="e.g. security" value={name} onChange={(e) => onNameChange(e.target.value)} />
        </div>
        <div style={formGroup}>
          <label style={label}><Bot size={10} /> Agent Name</label>
          <input style={input} placeholder="e.g. security-agent" value={agentName} onChange={(e) => setAgentName(e.target.value)} />
        </div>
        <div style={{ ...formGroup, gridColumn: '1 / -1' }}>
          <label style={label}><FileText size={10} /> Command Description</label>
          <input style={input} placeholder="Activate the X agent — short description" value={cmdDesc} onChange={(e) => setCmdDesc(e.target.value)} />
        </div>

        <hr style={separator} />

        <div style={formGroup}>
          <label style={label}><Cpu size={10} /> Model</label>
          <select style={input} value={model} onChange={(e) => setModel(e.target.value)}>
            <option>haiku</option>
            <option>sonnet</option>
            <option>opus</option>
          </select>
        </div>
        <div style={formGroup}>
          <label style={label}><Palette size={10} /> Color</label>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 6 }}>
            {ALL_COLORS.map((c) => (
              <div key={c} onClick={() => setColor(c)} style={{
                width: 24, height: 24, borderRadius: '50%', cursor: 'pointer', background: COLOR_MAP[c],
                border: color === c ? '2px solid var(--text-heading)' : '2px solid transparent',
              }} />
            ))}
          </div>
          <input style={input} placeholder="e.g. blue" value={color} onChange={(e) => setColor(e.target.value)} />
        </div>
        <div style={{ ...formGroup, gridColumn: '1 / -1' }}>
          <label style={label}><FileText size={10} /> Agent Description</label>
          <textarea style={{ ...input, ...mono }} rows={4} placeholder="Role description. Use when: triggering conditions." value={agentDesc} onChange={(e) => setAgentDesc(e.target.value)} />
        </div>
        <div style={{ ...formGroup, gridColumn: '1 / -1' }}>
          <label style={label}><Wrench size={10} /> Tools</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {ALL_TOOLS.map((t) => (
              <label key={t} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, cursor: 'pointer', color: 'var(--text-primary)' }}>
                <input type="checkbox" checked={tools.includes(t)} onChange={() => toggleTool(t)} style={{ accentColor: 'var(--accent)' }} />
                {t}
              </label>
            ))}
          </div>
        </div>

        <hr style={separator} />

        <div style={{ ...formGroup, gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={label}><FileText size={10} /> Command Body (Markdown)</label>
            <button onClick={() => setPromptModal('command')} style={btnSmall}>
              <Sparkles size={10} /> {cmdBody ? 'Edit via Prompt Builder' : 'Create via Prompt Builder'}
            </button>
          </div>
          <textarea style={{ ...input, ...mono, opacity: 0.7 }} rows={12} value={cmdBody} disabled
            placeholder="Use the Prompt Builder button above to generate this" />
        </div>
        <div style={{ ...formGroup, gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={label}><FileText size={10} /> Agent Body (Markdown)</label>
            <button onClick={() => setPromptModal('agent')} style={btnSmall}>
              <Sparkles size={10} /> {agentBody ? 'Edit via Prompt Builder' : 'Create via Prompt Builder'}
            </button>
          </div>
          <textarea style={{ ...input, ...mono, opacity: 0.7 }} rows={8} value={agentBody} disabled
            placeholder="Use the Prompt Builder button above to generate this" />
        </div>

        <div style={{ ...formGroup, gridColumn: '1 / -1', marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button onClick={() => navigate('/')} style={btnGhost}><X size={13} /> Cancel</button>
            <button onClick={onCreate} style={btnPrimary}><Plus size={13} /> Create Agent</button>
          </div>
        </div>
      </div>

      {promptModal === 'command' && (
        <PromptModal title="Create Command Body" currentValue={cmdBody} onInsert={(val) => setCmdBody(val)} onClose={() => setPromptModal(null)} />
      )}
      {promptModal === 'agent' && (
        <PromptModal title="Create Agent Body" currentValue={agentBody} onInsert={(val) => setAgentBody(val)} onClose={() => setPromptModal(null)} />
      )}
    </>
  );
}

const backBtn = {
  display: 'flex', alignItems: 'center', gap: 6, background: 'none',
  border: 'none', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer',
  marginBottom: 16, padding: 0, fontFamily: 'inherit',
};
const header = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 };
const headerTitle = { display: 'flex', alignItems: 'center', gap: 8, fontSize: 22, color: 'var(--text-heading)', fontWeight: 600 };
const formGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 };
const formGroup = { display: 'flex', flexDirection: 'column', gap: 6 };
const label = { fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: 0.5 };
const separator = { gridColumn: '1 / -1', border: 'none', borderTop: '1px solid var(--border)', margin: '8px 0' };
const input = { background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 6, padding: '10px 12px', color: 'var(--text-primary)', fontSize: 13, outline: 'none', fontFamily: 'inherit', resize: 'vertical' };
const mono = { fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace", fontSize: 12, lineHeight: 1.6 };
const btnPrimary = { padding: '8px 16px', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 500, background: 'var(--accent)', color: '#fff', cursor: 'pointer' };
const btnGhost = { padding: '8px 16px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13, fontWeight: 500, background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' };
const btnSmall = { padding: '4px 10px', border: '1px solid var(--border)', borderRadius: 4, fontSize: 11, background: 'transparent', color: 'var(--accent)', cursor: 'pointer', fontWeight: 500 };
