import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AlertTriangle, ScrollText, Database, ShieldCheck, BarChart3, RotateCcw } from 'lucide-react';
import DashboardPage from './pages/DashboardPage';
import PredictPage from './pages/PredictPage';
import WhatIfPage from './pages/WhatIfPage';
import LogsPage from './pages/LogsPage';
import DatasetPage from './pages/DatasetPage';
import { ToastProvider } from './ToastContext';

// ─────────────────────────────────────────────
//  ETHIX AI – Main Application Shell (v4.6)
// ─────────────────────────────────────────────

function SidebarItem({ to, label, Icon, active }: { to: string; label: string; Icon: any; active: boolean }) {
  return (
    <Link to={to} className={`nav-link ${active ? 'active' : ''}`}>
      <Icon className="nav-icon" />
      <span>{label}</span>
    </Link>
  );
}

function MainLayout() {
  const loc = useLocation();

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar-nav">
        <div className="logo-wrap">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div className="logo-icon">
              <ShieldCheck color="white" size={20} />
            </div>
            <div>
              <div className="logo-text">ETHIX AI</div>
              <div className="logo-sub">Bias Audit Suite</div>
            </div>
          </div>
        </div>

        <div style={{ padding: '8px 0', flex: 1, overflowY: 'auto' }}>
          <div className="nav-section-label">Monitoring</div>
          <SidebarItem to="/" label="Dashboard" Icon={BarChart3} active={loc.pathname === '/'} />
          <SidebarItem to="/predict" label="Bias Analysis" Icon={AlertTriangle} active={loc.pathname === '/predict'} />
          <SidebarItem to="/dataset" label="Dataset Audit" Icon={Database} active={loc.pathname === '/dataset'} />
          
          <div className="nav-section-label">Analysis Tools</div>
          <SidebarItem to="/whatif" label="Counterfactual Analysis" Icon={RotateCcw} active={loc.pathname === '/whatif'} />
          <SidebarItem to="/logs" label="Audit Logs" Icon={ScrollText} active={loc.pathname === '/logs'} />
        </div>

        <div className="sidebar-status">
          <div className="status-dot-wrap">
            <div className="status-dot" />
            <div style={{ fontSize: 11, fontWeight: 700, color: '#10b981' }}>v4.6 SECURE</div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="main-content">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/predict" element={<PredictPage />} />
          <Route path="/dataset" element={<DatasetPage />} />
          <Route path="/whatif" element={<WhatIfPage />} />
          <Route path="/logs" element={<LogsPage />} />
        </Routes>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <Router>
        <MainLayout />
      </Router>
    </ToastProvider>
  );
}
