import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { fetchAgents } from './api';
import Sidebar from './components/Sidebar';
import GridView from './components/GridView';
import AgentViewer from './components/AgentViewer';
import AgentEditor from './components/AgentEditor';
import AddView from './components/AddView';
import WorkflowView from './components/WorkflowView';
import Toast from './components/Toast';

export const ThemeContext = createContext();
export const AgentsContext = createContext();

export function useTheme() { return useContext(ThemeContext); }
export function useAgents() { return useContext(AgentsContext); }

export default function App() {
  const [agents, setAgents] = useState([]);
  const [toast, setToast] = useState(null);
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'light');

  const reload = useCallback(async () => {
    const data = await fetchAgents();
    setAgents(data);
  }, []);

  useEffect(() => { reload(); }, [reload]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  function toggleTheme() {
    setTheme(t => t === 'light' ? 'dark' : 'light');
  }

  function notify(msg, isError = false) {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 2600);
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <AgentsContext.Provider value={{ agents, reload, notify }}>
        <Sidebar />
        <main style={{ flex: 1, overflowY: 'auto', padding: 32 }}>
          <Routes>
            <Route path="/" element={<GridView />} />
            <Route path="/agents/:id" element={<AgentViewer />} />
            <Route path="/agents/:id/edit" element={<AgentEditor />} />
            <Route path="/new" element={<AddView />} />
            <Route path="/workflow" element={<WorkflowView />} />
          </Routes>
        </main>
        {toast && <Toast msg={toast.msg} isError={toast.isError} />}
      </AgentsContext.Provider>
    </ThemeContext.Provider>
  );
}
