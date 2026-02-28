import { useLocation, useNavigate } from 'react-router-dom';
import { useTheme, useAgents } from '../App';
import { agentColor } from '../constants';
import { LayoutGrid, GitBranch, Sun, Moon, Bot, Plus } from 'lucide-react';

export default function Sidebar() {
  const { agents } = useAgents();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <nav style={sidebar}>
      <div style={headerBox}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <Bot size={20} style={{ color: 'var(--accent)' }} />
          <div style={titleStyle}>Dev Agents</div>
        </div>
        <div style={subtitleStyle}>{agents.length} agents configured</div>
      </div>

      <div style={agentSection}>
        <div style={sectionTitleStyle}>Agents</div>
        {agents.map((a) => {
          const color = a.agent ? agentColor(a.agent.meta.color) : '#666';
          const isActive = location.pathname.startsWith(`/agents/${a.id}`);
          const isDisabled = a.command.meta.disabled;
          return (
            <button
              key={a.id}
              onClick={() => navigate(`/agents/${a.id}`)}
              style={{
                ...itemStyle,
                background: isActive ? 'var(--accent-light)' : 'transparent',
                color: isActive ? 'var(--accent)' : 'var(--text-primary)',
                opacity: isDisabled ? 0.4 : 1,
                textDecoration: isDisabled ? 'line-through' : 'none',
              }}
            >
              <span style={{ width: 8, height: 8, borderRadius: '50%', flexShrink: 0, background: color }} />
              /{a.id}
            </button>
          );
        })}
        <button
          onClick={() => navigate('/new')}
          style={{ ...itemStyle, color: 'var(--accent)', marginTop: 4 }}
        >
          <Plus size={14} />
          New Agent
        </button>
      </div>

      <div style={viewsSection}>
        <div style={sectionTitleStyle}>Views</div>
        <button
          onClick={() => navigate('/')}
          style={{
            ...itemStyle,
            background: location.pathname === '/' ? 'var(--accent-light)' : 'transparent',
            color: location.pathname === '/' ? 'var(--accent)' : 'var(--text-primary)',
          }}
        >
          <LayoutGrid size={14} /> Grid
        </button>
        <button
          onClick={() => navigate('/workflow')}
          style={{
            ...itemStyle,
            background: location.pathname === '/workflow' ? 'var(--accent-light)' : 'transparent',
            color: location.pathname === '/workflow' ? 'var(--accent)' : 'var(--text-primary)',
          }}
        >
          <GitBranch size={14} /> Workflow
        </button>

        <button onClick={toggleTheme} style={{ ...itemStyle, marginTop: 8 }}>
          {theme === 'light' ? <Moon size={14} /> : <Sun size={14} />}
          {theme === 'light' ? 'Dark mode' : 'Light mode'}
        </button>
      </div>
    </nav>
  );
}

const sidebar = {
  width: 250, minWidth: 250, background: 'var(--bg-sidebar)',
  borderRight: '1px solid var(--border)', display: 'flex',
  flexDirection: 'column', overflowY: 'auto', transition: 'background 0.2s',
};
const headerBox = { padding: '20px 20px 16px', borderBottom: '1px solid var(--border)' };
const titleStyle = { fontSize: 16, color: 'var(--text-heading)', fontWeight: 700 };
const subtitleStyle = { fontSize: 11, color: 'var(--text-secondary)', marginTop: 6, paddingLeft: 28 };
const agentSection = { padding: '12px 0', borderBottom: '1px solid var(--border)', flex: 1, overflowY: 'auto' };
const sectionTitleStyle = { padding: '0 20px', fontSize: 10, textTransform: 'uppercase', letterSpacing: 1, color: 'var(--text-secondary)', marginBottom: 8, fontWeight: 600 };
const itemStyle = {
  display: 'flex', alignItems: 'center', gap: 10, padding: '7px 20px',
  cursor: 'pointer', fontSize: 13, transition: 'background 0.15s',
  border: 'none', width: '100%', textAlign: 'left', fontFamily: 'inherit',
  borderRadius: 0,
};
const viewsSection = { padding: '12px 0', borderTop: '1px solid var(--border)' };
