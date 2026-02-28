import { useNavigate } from 'react-router-dom';
import { useAgents } from '../App';
import { agentColor } from '../constants';
import { GitBranch, ArrowRight, Zap, Shield, Filter, FileCheck } from 'lucide-react';

export default function WorkflowView() {
  const { agents } = useAgents();
  const navigate = useNavigate();

  function Node({ id }) {
    const a = agents.find((x) => x.id === id);
    const color = a?.agent ? agentColor(a.agent.meta.color) : '#666';
    return (
      <div onClick={() => navigate(`/agents/${id}`)} style={{ ...pipelineNode, borderColor: color }}>
        /{id}
      </div>
    );
  }

  return (
    <>
      <div style={headerBox}><h2 style={headerTitle}><GitBranch size={20} /> Workflow</h2></div>

      <div style={section}>
        <h3 style={sectionTitle}><ArrowRight size={14} /> Feature Development Pipeline</h3>
        <div style={pipeline}>
          <Node id="plan" /> <span style={arrow}>&rarr;</span>
          <Node id="code" /> <span style={arrow}>&rarr;</span>
          <Node id="test" /> <span style={arrow}>&rarr;</span>
          <Node id="quality" />
        </div>
      </div>

      <div style={section}>
        <h3 style={sectionTitle}><Zap size={14} /> Standalone Agents</h3>
        <div style={{ ...pipeline, gap: 12, flexWrap: 'wrap' }}>
          <Node id="design" /> <Node id="debug" /> <Node id="brainstorm" />
          <Node id="security" /> <Node id="best-practices" />
        </div>
      </div>

      <div style={section}>
        <h3 style={sectionTitle}><Shield size={14} /> /review — Multi-Agent Orchestrator</h3>
        <div style={reviewTree}>
          <div style={{ ...reviewNode, borderWidth: 2, fontWeight: 600, color: 'var(--text-heading)', cursor: 'pointer' }}
            onClick={() => navigate('/agents/review')}>/review</div>
          <div style={connector}>&darr;</div>
          <div style={reviewNode}>
            <div>Haiku: Load project guidelines</div>
            <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 4 }}>CLAUDE.md, .cursorrules, .coderabbit.yaml</div>
          </div>
          <div style={connector}>&darr;</div>
          <div style={reviewStage}>
            <div style={{ ...reviewNode, borderColor: '#3b82f6' }}>Guideline<br />Compliance</div>
            <div style={{ ...reviewNode, borderColor: '#14b8a6' }}>Best<br />Practices</div>
            <div style={{ ...reviewNode, borderColor: '#22c55e' }}>DRY &<br />Abstraction</div>
            <div style={{ ...reviewNode, borderColor: '#f97316' }}>Security<br />Scan</div>
            <div style={{ ...reviewNode, borderColor: '#eab308' }}>Errors, Perf<br />& Naming</div>
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>5 parallel Sonnet agents</div>
          <div style={connector}>&darr;</div>
          <div style={reviewNode}>Parallel Haiku agents: Confidence scoring (0-100)</div>
          <div style={connector}>&darr;</div>
          <div style={{ ...reviewNode, borderColor: '#a855f7' }}>Filter &ge; 80 &bull; Deduplicate &bull; Rank by severity</div>
          <div style={connector}>&darr;</div>
          <div style={{ ...reviewNode, borderColor: 'var(--success)', color: 'var(--success)', fontWeight: 600 }}>Final Report</div>
        </div>
      </div>
    </>
  );
}

const headerBox = { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 };
const headerTitle = { display: 'flex', alignItems: 'center', gap: 8, fontSize: 22, color: 'var(--text-heading)', fontWeight: 600 };
const section = { marginBottom: 40 };
const sectionTitle = { display: 'flex', alignItems: 'center', gap: 8, fontSize: 16, color: 'var(--text-heading)', marginBottom: 16 };
const pipeline = { display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' };
const arrow = { fontSize: 18, color: 'var(--text-secondary)' };
const pipelineNode = {
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  padding: '12px 20px', borderRadius: 8, background: 'var(--bg-card)',
  border: '2px solid var(--border)', fontSize: 14, fontWeight: 500,
  color: 'var(--text-heading)', cursor: 'pointer', transition: 'transform 0.15s',
  boxShadow: 'var(--shadow-card)',
};
const reviewTree = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, marginTop: 16 };
const reviewStage = { display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', justifyContent: 'center' };
const reviewNode = {
  padding: '8px 14px', borderRadius: 6, background: 'var(--bg-card)',
  border: '1px solid var(--border)', fontSize: 12, color: 'var(--text-secondary)',
  textAlign: 'center', boxShadow: 'var(--shadow-card)',
};
const connector = { fontSize: 20, color: 'var(--text-secondary)' };
