import { useState } from 'react';
import Modal from './Modal';
import { enhancePrompt } from '../api';
import { Sparkles, FileText, Pencil, ArrowLeft, Check, ClipboardPaste, Wand2 } from 'lucide-react';

export default function PromptModal({ title, currentValue, onInsert, onClose }) {
  const [mode, setMode] = useState(currentValue ? 'modify' : 'choose');
  const [rawPrompt, setRawPrompt] = useState('');
  const [modifyInstruction, setModifyInstruction] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = !!currentValue;
  const type = title.toLowerCase().includes('command') ? 'command' : 'agent';

  async function onEnhance() {
    if (!rawPrompt.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await enhancePrompt({ mode: 'enhance', input: rawPrompt, type });
      if (res.error) throw new Error(res.error);
      setResult(res.result);
      setMode('preview');
    } catch (err) {
      setError(err.message || 'Enhancement failed');
    } finally {
      setLoading(false);
    }
  }

  async function onApplyModification() {
    if (!modifyInstruction.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await enhancePrompt({
        mode: 'modify',
        input: modifyInstruction,
        currentPrompt: currentValue,
        type,
      });
      if (res.error) throw new Error(res.error);
      setResult(res.result);
      setMode('preview');
    } catch (err) {
      setError(err.message || 'Modification failed');
    } finally {
      setLoading(false);
    }
  }

  function onAccept() {
    onInsert(result);
    onClose();
  }

  const modeDescriptions = {
    choose: 'How would you like to set the prompt?',
    raw: 'Paste your raw prompt directly. It will be used as-is.',
    enhance: 'Describe the agent in plain language. Claude will structure it into a proper prompt.',
    modify: 'Describe what you want to change in natural language. Claude will apply the modification.',
    preview: 'Review the result below. Edit if needed, then insert.',
  };

  return (
    <Modal onClose={onClose}>
      <h3 style={{ color: 'var(--text-heading)', marginBottom: 4, fontSize: 16 }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', fontSize: 12, marginBottom: 16 }}>
        {modeDescriptions[mode]}
      </p>

      {error && (
        <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid var(--danger)', borderRadius: 6, padding: '8px 12px', marginBottom: 12, fontSize: 12, color: 'var(--danger)' }}>
          {error}
        </div>
      )}

      {/* Mode chooser (for new prompts) */}
      {mode === 'choose' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <button onClick={() => setMode('raw')} style={modeBtn}>
            <strong><ClipboardPaste size={13} style={{ verticalAlign: -2 }} /> Raw Insert</strong>
            <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Paste a complete prompt as-is</span>
          </button>
          <button onClick={() => setMode('enhance')} style={modeBtn}>
            <strong><Wand2 size={13} style={{ verticalAlign: -2 }} /> AI Enhance &amp; Structure</strong>
            <span style={{ color: 'var(--text-secondary)', fontSize: 12 }}>Describe it in plain language — Claude structures it</span>
          </button>
          <div style={actions}>
            <button onClick={onClose} style={btnGhost}>Cancel</button>
          </div>
        </div>
      )}

      {/* Modify mode (for editing existing) */}
      {mode === 'modify' && (
        <>
          <div style={{ background: 'var(--bg-input)', border: '1px solid var(--border)', borderRadius: 6, padding: 10, marginBottom: 12, maxHeight: 150, overflowY: 'auto' }}>
            <div style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--text-secondary)', marginBottom: 4, letterSpacing: 0.5 }}>Current Prompt</div>
            <pre style={{ fontSize: 11, color: 'var(--text-primary)', whiteSpace: 'pre-wrap', fontFamily: 'monospace', margin: 0 }}>{currentValue}</pre>
          </div>
          <textarea
            value={modifyInstruction}
            onChange={(e) => setModifyInstruction(e.target.value)}
            placeholder="Describe your changes in natural language, e.g.:&#10;• Add OWASP Top 10 vulnerability checks&#10;• Make the approach more focused on React apps&#10;• Remove the performance section and expand security"
            style={textArea}
            rows={4}
            autoFocus
            disabled={loading}
          />
          <div style={actions}>
            <button onClick={onClose} style={btnGhost} disabled={loading}>Cancel</button>
            <button onClick={() => { setResult(currentValue); setMode('preview'); }} style={btnOutline} disabled={loading}><Pencil size={12} /> Edit Full Prompt</button>
            <button onClick={onApplyModification} style={btnPrimary} disabled={loading}>
              {loading ? '⏳ Claude is thinking...' : <><Sparkles size={12} /> Apply with AI</>}
            </button>
          </div>
        </>
      )}

      {/* Raw insert */}
      {mode === 'raw' && (
        <>
          <textarea
            value={rawPrompt}
            onChange={(e) => setRawPrompt(e.target.value)}
            placeholder="Paste your complete prompt here..."
            style={textArea}
            rows={10}
            autoFocus
          />
          <div style={actions}>
            <button onClick={() => isEditing ? setMode('modify') : setMode('choose')} style={btnGhost}>Back</button>
            <button onClick={() => { setResult(rawPrompt); setMode('preview'); }} style={btnPrimary}><FileText size={12} /> Preview</button>
          </div>
        </>
      )}

      {/* Enhance mode */}
      {mode === 'enhance' && (
        <>
          <textarea
            value={rawPrompt}
            onChange={(e) => setRawPrompt(e.target.value)}
            placeholder="Describe the agent in plain language, e.g.:&#10;&#10;A security engineer that does deep threat modeling using STRIDE, checks auth flows end-to-end, finds injection vectors, and audits dependencies for CVEs. Should focus on real exploitable issues not theoretical risks."
            style={textArea}
            rows={8}
            autoFocus
            disabled={loading}
          />
          <div style={actions}>
            <button onClick={() => isEditing ? setMode('modify') : setMode('choose')} style={btnGhost} disabled={loading}>Back</button>
            <button onClick={onEnhance} style={btnPrimary} disabled={loading}>
              {loading ? '⏳ Claude is thinking...' : <><Wand2 size={12} /> Enhance with AI</>}
            </button>
          </div>
        </>
      )}

      {/* Preview / final edit */}
      {mode === 'preview' && (
        <>
          <textarea
            value={result}
            onChange={(e) => setResult(e.target.value)}
            style={{ ...textArea, minHeight: 200 }}
            rows={14}
          />
          <div style={actions}>
            <button onClick={() => isEditing ? setMode('modify') : setMode('choose')} style={btnGhost}>Back</button>
            <button onClick={onAccept} style={btnPrimary}><Check size={12} /> Insert Prompt</button>
          </div>
        </>
      )}
    </Modal>
  );
}

const textArea = {
  width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border)',
  borderRadius: 6, padding: '10px 12px', color: 'var(--text-primary)',
  fontFamily: "'SF Mono', 'Fira Code', 'Cascadia Code', 'Consolas', monospace",
  fontSize: 12, lineHeight: 1.6, resize: 'vertical', outline: 'none',
};
const actions = { display: 'flex', justifyContent: 'flex-end', gap: 8, marginTop: 16 };
const modeBtn = {
  display: 'flex', flexDirection: 'column', gap: 2, textAlign: 'left',
  padding: '12px 16px', background: 'var(--bg-input)', border: '1px solid var(--border)',
  borderRadius: 8, cursor: 'pointer', color: 'var(--text-heading)', fontSize: 13, transition: 'border-color 0.15s',
};
const btnPrimary = { padding: '8px 16px', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 500, background: 'var(--accent)', color: '#fff', cursor: 'pointer' };
const btnGhost = { padding: '8px 16px', border: '1px solid var(--border)', borderRadius: 6, fontSize: 13, fontWeight: 500, background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer' };
const btnOutline = { padding: '8px 16px', border: '1px solid var(--accent)', borderRadius: 6, fontSize: 13, fontWeight: 500, background: 'transparent', color: 'var(--accent)', cursor: 'pointer' };
