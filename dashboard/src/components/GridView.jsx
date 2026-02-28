import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toggleAgent, deleteAgent } from '../api';
import { useAgents } from '../App';
import { agentColor, getDescription } from '../constants';
import { Plus, Trash2, Wrench, Cpu, Palette, AlertTriangle } from 'lucide-react';
import Modal from './Modal';

export default function GridView() {
  const { agents, reload, notify } = useAgents();
  const navigate = useNavigate();
  const [deleteId, setDeleteId] = useState(null);

  async function onToggle(e, id) {
    e.stopPropagation();
    await toggleAgent(id);
    await reload();
    notify(`Toggled /${id}`);
  }

  async function onDelete() {
    if (!deleteId) return;
    const id = deleteId;
    await deleteAgent(id);
    setDeleteId(null);
    await reload();
    notify(`Deleted /${id}`);
  }

  const deleteTarget = agents.find((a) => a.id === deleteId);

  return (
    <>
      <div style={header}>
        <div>
          <h2 style={headerTitle}>All Agents</h2>
          <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>Manage your development agent team</p>
        </div>
        <button onClick={() => navigate('/new')} style={btnPrimary}>
          <Plus size={15} /> New Agent
        </button>
      </div>

      <div style={grid}>
        {agents.map((a) => {
          const color = a.agent ? agentColor(a.agent.meta.color) : '#666';
          const isDisabled = a.command.meta.disabled;
          return (
            <div
              key={a.id}
              onClick={() => navigate(`/agents/${a.id}`)}
              style={{ ...card, borderLeftColor: color, opacity: isDisabled ? 0.5 : 1, cursor: 'pointer' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ width: 10, height: 10, borderRadius: '50%', background: color, display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-heading)' }}>/{a.id}</span>
                </div>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <label style={toggleBox} onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={!isDisabled} onChange={(e) => onToggle(e, a.id)} style={{ display: 'none' }} />
                    <span style={{ ...slider, background: isDisabled ? 'var(--border)' : 'var(--success)' }}>
                      <span style={{ ...knob, transform: isDisabled ? 'translateX(0)' : 'translateX(16px)' }} />
                    </span>
                  </label>
                  <button onClick={(e) => { e.stopPropagation(); setDeleteId(a.id); }} style={iconBtn} title="Delete">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div style={descStyle}>{getDescription(a)}</div>

              <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', marginBottom: 10 }}>
                <span style={pill}><Cpu size={10} /> {a.agent?.meta.model || '—'}</span>
                <span style={pill}>
                  <Palette size={10} />
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: color, display: 'inline-block' }} />
                  {a.agent?.meta.color || '—'}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: 'var(--text-secondary)' }}>
                <Wrench size={11} />
                {a.agent?.meta.tools?.join(', ') || 'No tools'}
              </div>
            </div>
          );
        })}
      </div>

      {deleteId && (
        <Modal onClose={() => setDeleteId(null)}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(239,68,68,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <AlertTriangle size={18} style={{ color: 'var(--danger)' }} />
            </div>
            <h3 style={{ color: 'var(--text-heading)', fontSize: 16 }}>Delete /{deleteId}?</h3>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 13, marginBottom: 10, lineHeight: 1.5 }}>This will permanently remove:</p>
          <code style={codeBlock}>commands/{deleteId}.md</code>
          {deleteTarget?.agent && <code style={codeBlock}>agents/{deleteTarget.agent.filename}</code>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 20 }}>
            <button onClick={() => setDeleteId(null)} style={btnGhost}>Cancel</button>
            <button onClick={onDelete} style={btnDanger}>
              <Trash2 size={13} /> Delete
            </button>
          </div>
        </Modal>
      )}
    </>
  );
}

const header = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 };
const headerTitle = { fontSize: 24, color: 'var(--text-heading)', fontWeight: 700 };
const grid = { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 16 };
const card = {
  background: 'var(--bg-card)', borderRadius: 10, padding: 20,
  borderLeft: '4px solid var(--border)', boxShadow: 'var(--shadow-card)',
  transition: 'transform 0.15s, box-shadow 0.15s',
};
const toggleBox = { position: 'relative', width: 36, height: 20, cursor: 'pointer', display: 'inline-block' };
const slider = { position: 'absolute', inset: 0, borderRadius: 10, transition: 'background 0.2s' };
const knob = { position: 'absolute', width: 16, height: 16, borderRadius: '50%', background: '#fff', top: 2, left: 2, transition: 'transform 0.2s' };
const descStyle = { fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: 14 };
const pill = { display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 12, fontSize: 11, background: 'var(--accent-light)', color: 'var(--text-secondary)', fontWeight: 500 };
const iconBtn = { background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)', padding: 4, borderRadius: 4, display: 'flex', alignItems: 'center' };
const btnPrimary = { padding: '8px 18px', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, background: 'var(--accent)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 };
const btnGhost = { padding: '8px 16px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, fontWeight: 500, background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' };
const btnDanger = { padding: '8px 16px', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, background: 'var(--danger)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6 };
const codeBlock = { display: 'block', background: 'var(--bg-input)', padding: '6px 10px', borderRadius: 6, fontSize: 12, margin: '4px 0', color: 'var(--text-primary)', fontFamily: 'monospace' };
