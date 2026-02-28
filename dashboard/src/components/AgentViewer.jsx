import { useParams, useNavigate } from 'react-router-dom';
import { useAgents } from '../App';
import { agentColor, getDescription } from '../constants';
import { Pencil, Cpu, Palette, Wrench, FileText, Bot, ShieldOff, ArrowLeft } from 'lucide-react';

export default function AgentViewer() {
  const { id } = useParams();
  const { agents } = useAgents();
  const navigate = useNavigate();

  const agent = agents.find((a) => a.id === id);
  if (!agent) return <div style={{ color: 'var(--text-secondary)', padding: 40, textAlign: 'center' }}>Agent not found</div>;

  const color = agent.agent ? agentColor(agent.agent.meta.color) : '#666';
  const am = agent.agent?.meta || {};
  const isDisabled = agent.command.meta.disabled;

  return (
    <>
      <button onClick={() => navigate('/')} style={backBtn}>
        <ArrowLeft size={14} /> Back to Grid
      </button>

      <div style={header}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: color + '22', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `2px solid ${color}` }}>
              <Bot size={18} style={{ color }} />
            </div>
            <div>
              <h2 style={headerTitle}>/{id}</h2>
              {isDisabled && <span style={disabledBadge}><ShieldOff size={10} /> Disabled</span>}
            </div>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginTop: 10, lineHeight: 1.5, maxWidth: 600 }}>
            {getDescription(agent)}
          </p>
        </div>
        <button onClick={() => navigate(`/agents/${id}/edit`)} style={btnPrimary}>
          <Pencil size={14} /> Edit Agent
        </button>
      </div>

      <div style={infoGrid}>
        <div style={infoCard}>
          <div style={infoLabel}><Cpu size={12} /> Model</div>
          <div style={infoValue}>{am.model || '—'}</div>
        </div>
        <div style={infoCard}>
          <div style={infoLabel}><Palette size={12} /> Color</div>
          <div style={{ ...infoValue, display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ width: 16, height: 16, borderRadius: '50%', background: color, display: 'inline-block', border: '2px solid var(--border)' }} />
            {am.color || '—'}
          </div>
        </div>
        <div style={{ ...infoCard, gridColumn: '1 / -1' }}>
          <div style={infoLabel}><Wrench size={12} /> Tools</div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginTop: 6 }}>
            {(am.tools || []).map((t) => (
              <span key={t} style={toolPill}>{t}</span>
            ))}
            {(!am.tools || am.tools.length === 0) && <span style={{ color: 'var(--text-secondary)', fontSize: 13 }}>None configured</span>}
          </div>
        </div>
      </div>

      <div style={sectionBox}>
        <h3 style={sectionTitle}><FileText size={14} /> Agent Description</h3>
        <div style={preBlock}>{am.description || 'No description'}</div>
      </div>

      <div style={sectionBox}>
        <h3 style={sectionTitle}><FileText size={14} /> Command Body</h3>
        <pre style={codePreBlock}>{agent.command.body || 'Empty'}</pre>
      </div>

      <div style={sectionBox}>
        <h3 style={sectionTitle}><FileText size={14} /> Agent Body</h3>
        <pre style={codePreBlock}>{agent.agent?.body || 'Empty'}</pre>
      </div>
    </>
  );
}

const backBtn = {
  display: 'flex', alignItems: 'center', gap: 6, background: 'none',
  border: 'none', color: 'var(--text-secondary)', fontSize: 13, cursor: 'pointer',
  marginBottom: 16, padding: 0, fontFamily: 'inherit',
};
const header = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 };
const headerTitle = { fontSize: 24, color: 'var(--text-heading)', fontWeight: 700 };
const disabledBadge = { display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 4, fontSize: 11, fontWeight: 500, background: 'rgba(239,68,68,0.1)', color: 'var(--danger)', marginTop: 2 };
const btnPrimary = { padding: '8px 18px', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, background: 'var(--accent)', color: '#fff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, height: 'fit-content' };

const infoGrid = { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 28 };
const infoCard = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 18, boxShadow: 'var(--shadow-card)' };
const infoLabel = { display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5, color: 'var(--text-secondary)', marginBottom: 8 };
const infoValue = { fontSize: 15, fontWeight: 500, color: 'var(--text-heading)' };
const toolPill = { padding: '4px 12px', borderRadius: 6, fontSize: 12, background: 'var(--accent-light)', color: 'var(--accent)', fontWeight: 500 };

const sectionBox = { marginBottom: 24 };
const sectionTitle = { display: 'flex', alignItems: 'center', gap: 8, fontSize: 14, fontWeight: 600, color: 'var(--text-heading)', marginBottom: 10 };
const preBlock = { background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: 18, fontSize: 13, lineHeight: 1.6, color: 'var(--text-primary)', whiteSpace: 'pre-wrap', boxShadow: 'var(--shadow-card)' };
const codePreBlock = {
  ...preBlock,
  fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace",
  fontSize: 12, maxHeight: 400, overflowY: 'auto',
};
