import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { updateAgent } from '../api';
import { useAgents } from '../App';
import { ALL_COLORS, ALL_TOOLS, COLOR_MAP } from '../constants';
import PromptModal from './PromptModal';
import { ArrowLeft, Save, X, Cpu, Palette, Wrench, FileText, Settings, Sparkles } from 'lucide-react';

export default function AgentEditor() {
  const { id } = useParams();
  const { agents, reload, notify } = useAgents();
  const navigate = useNavigate();

  const agent = agents.find((a) => a.id === id);

  const [cmdDesc, setCmdDesc] = useState('');
  const [invocable, setInvocable] = useState('true');
  const [model, setModel] = useState('sonnet');
  const [color, setColor] = useState('');
  const [agentDesc, setAgentDesc] = useState('');
  const [tools, setTools] = useState([]);
  const [cmdBody, setCmdBody] = useState('');
  const [agentBody, setAgentBody] = useState('');
  const [promptModal, setPromptModal] = useState(null); // 'command' | 'agent' | null

  useEffect(() => {
    if (!agent) return;
    setCmdDesc(agent.command.meta.description || '');
    setInvocable(agent.command.meta['user-invocable'] === false ? 'false' : 'true');
    setModel(agent.agent?.meta.model || 'sonnet');
    setColor(agent.agent?.meta.color || '');
    setAgentDesc(agent.agent?.meta.description || '');
    setTools(agent.agent?.meta.tools || []);
    setCmdBody(agent.command.body || '');
    setAgentBody(agent.agent?.body || '');
  }, [agent]);

  if (!agent) return <div style={{ color: 'var(--text-secondary)' }}>Agent not found</div>;

  function toggleTool(tool) {
    setTools((prev) => prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]);
  }

  async function onSave() {
    const data = {
      command: {
        meta: {
          name: agent.command.meta.name,
          description: cmdDesc,
          'user-invocable': invocable === 'true',
        },
        body: cmdBody,
      },
      agent: {
        meta: {
          name: agent.agent?.meta.name || `${id}-agent`,
          description: agentDesc,
          model,
          color,
          tools,
        },
        body: agentBody,
      },
    };

    if (agent.command.meta.disabled) {
      data.command.meta.disabled = true;
      data.command.meta['user-invocable'] = false;
    }
    if (agent.agent?.meta.disabled) {
      data.agent.meta.disabled = true;
    }

    await updateAgent(id, data);
    await reload();
    notify(`Saved /${id}`);
    navigate(`/agents/${id}`);
  }

  return (
    <>
      <button onClick={() => navigate(`/agents/${id}`)} style={backBtn}>
        <ArrowLeft size={14} /> Back to Agent
      </button>

      <div style={header}>
        <h2 style={headerTitle}><Settings size={20} /> Edit /{id}</h2>
      </div>

      <div style={formGrid}>
        {/* --- Command Config --- */}
        <div style={formGroup}>
          <label style={label}><FileText size={10} /> Command Name</label>
          <input style={{ ...input, opacity: 0.6 }} value={agent.command.meta.name} readOnly />
        </div>
        <div style={formGroup}>
          <label style={label}><Settings size={10} /> User Invocable</label>
          <select style={input} value={invocable} onChange={(e) => setInvocable(e.target.value)}>
            <option value="true">Yes</option>
            <option value="false">No</option>
          </select>
        </div>
        <div style={{ ...formGroup, gridColumn: '1 / -1' }}>
          <label style={label}><FileText size={10} /> Command Description</label>
          <input style={input} value={cmdDesc} onChange={(e) => setCmdDesc(e.target.value)} />
        </div>

        <hr style={separator} />

        {/* --- Agent Config --- */}
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
              <div
                key={c}
                onClick={() => setColor(c)}
                style={{
                  width: 24, height: 24, borderRadius: '50%', cursor: 'pointer',
                  background: COLOR_MAP[c],
                  border: color === c ? '2px solid var(--text-heading)' : '2px solid transparent',
                  transition: 'transform 0.15s',
                }}
              />
            ))}
          </div>
          <input style={input} value={color} onChange={(e) => setColor(e.target.value)} />
        </div>
        <div style={{ ...formGroup, gridColumn: '1 / -1' }}>
          <label style={label}><FileText size={10} /> Agent Description</label>
          <textarea style={{ ...input, ...mono }} rows={4} value={agentDesc} onChange={(e) => setAgentDesc(e.target.value)} />
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

        {/* --- Prompt Fields (disabled, edit via modal) --- */}
        <div style={{ ...formGroup, gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={label}><FileText size={10} /> Command Body (Markdown)</label>
            <button onClick={() => setPromptModal('command')} style={btnSmall}><Sparkles size={10} /> Edit via Prompt Builder</button>
          </div>
          <textarea style={{ ...input, ...mono, opacity: 0.7 }} rows={12} value={cmdBody} disabled />
        </div>
        <div style={{ ...formGroup, gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={label}><FileText size={10} /> Agent Body (Markdown)</label>
            <button onClick={() => setPromptModal('agent')} style={btnSmall}><Sparkles size={10} /> Edit via Prompt Builder</button>
          </div>
          <textarea style={{ ...input, ...mono, opacity: 0.7 }} rows={8} value={agentBody} disabled />
        </div>

        {/* --- Submit Buttons at Bottom --- */}
        <div style={{ ...formGroup, gridColumn: '1 / -1', marginTop: 12 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
            <button onClick={() => navigate(`/agents/${id}`)} style={btnGhost}><X size={13} /> Cancel</button>
            <button onClick={onSave} style={btnPrimary}><Save size={13} /> Save Changes</button>
          </div>
        </div>
      </div>

      {/* --- Prompt Enhancement Modal --- */}
      {promptModal === 'command' && (
        <PromptModal
          title="Edit Command Body"
          currentValue={cmdBody}
          onInsert={(val) => setCmdBody(val)}
          onClose={() => setPromptModal(null)}
        />
      )}
      {promptModal === 'agent' && (
        <PromptModal
          title="Edit Agent Body"
          currentValue={agentBody}
          onInsert={(val) => setAgentBody(val)}
          onClose={() => setPromptModal(null)}
        />
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

const input = {
  background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 6,
  padding: '10px 12px', color: 'var(--text-primary)', fontSize: 13, outline: 'none',
  fontFamily: 'inherit', resize: 'vertical',
};

const mono = {
  fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace",
  fontSize: 12, lineHeight: 1.6,
};

const btnPrimary = { padding: '8px 16px', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 500, background: 'var(--accent)', color: '#fff', cursor: 'pointer' };
const btnGhost = { padding: '8px 16px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13, fontWeight: 500, background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' };
const btnSmall = { padding: '4px 10px', border: '1px solid var(--border)', borderRadius: 4, fontSize: 11, background: 'transparent', color: 'var(--accent)', cursor: 'pointer', fontWeight: 500 };
