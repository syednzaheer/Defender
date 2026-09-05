import React, { useState } from 'react';
import {
  Home,
  PlayCircle,
  Activity,
  HelpCircle,
  BarChart3,
  Code2,
  LogOut,
  Shield,
  CheckCircle2
} from 'lucide-react';
import Badge from '../ui/Badge';

const Sidebar = ({ activeTab, onTabChange }) => {
  const [logoError, setLogoError] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'demo', label: 'Demo Runner', icon: PlayCircle },
    { id: 'forecast', label: 'Run Forecast', icon: Activity },
    { id: 'how_it_works', label: 'How It Works', icon: HelpCircle },
    { id: 'evidence', label: 'Evidence & Benchmark', icon: BarChart3 },
    { id: 'technical', label: 'Technical Details', icon: Code2 },
  ];

  return (
    <aside
      className="defender-sidebar"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        width: '250px',
        zIndex: 60,
        backgroundColor: 'rgba(7, 9, 14, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid var(--border-subtle)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '20px 16px',
        transition: 'transform 0.3s ease',
      }}
    >
      {/* Top Header & Brand */}
      <div>
        <div
          onClick={() => onTabChange('home')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            cursor: 'pointer',
            paddingBottom: '20px',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            marginBottom: '20px',
          }}
        >
          <div
            style={{
              width: '38px',
              height: '38px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '10px',
              backgroundColor: 'rgba(6, 182, 212, 0.1)',
              border: '1px solid rgba(6, 182, 212, 0.2)',
            }}
          >
            {!logoError ? (
              <img
                src="/assets/branding/logo.png"
                alt="Defender Emblem"
                width={30}
                height={30}
                onError={() => setLogoError(true)}
                style={{ objectFit: 'contain' }}
              />
            ) : (
              <Shield size={22} color="#06B6D4" />
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span
              style={{
                fontFamily: 'var(--font-heading)',
                fontWeight: 800,
                fontSize: '18px',
                letterSpacing: '0.04em',
                color: 'var(--text-primary)',
                lineHeight: 1.1,
              }}
            >
              DEFENDER
            </span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                color: '#06B6D4',
                letterSpacing: '0.06em',
                marginTop: '2px',
              }}
            >
              NTRO PS 26153
            </span>
          </div>
        </div>

        {/* System Status Indicator */}
        <div style={{ marginBottom: '24px', padding: '0 4px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'rgba(16, 185, 129, 0.08)',
              border: '1px solid rgba(16, 185, 129, 0.2)',
              borderRadius: '8px',
              padding: '8px 12px',
            }}
          >
            <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10B981', boxShadow: '0 0 8px #10B981' }} />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', fontWeight: 600, color: '#10B981', letterSpacing: '0.04em' }}>
              SYSTEM READY
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: isActive ? '1px solid rgba(6, 182, 212, 0.3)' : '1px solid transparent',
                  backgroundColor: isActive ? 'rgba(6, 182, 212, 0.12)' : 'transparent',
                  color: isActive ? '#06B6D4' : 'var(--text-secondary)',
                  fontFamily: 'var(--font-body)',
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 500,
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.18s ease',
                  boxShadow: isActive ? '0 0 12px rgba(6, 182, 212, 0.15)' : 'none',
                }}
                className="sidebar-nav-btn"
              >
                <Icon size={18} color={isActive ? '#06B6D4' : 'var(--text-muted)'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer / Logout Control */}
      <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '16px' }}>
        <button
          onClick={() => onTabChange('entry')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            width: '100%',
            padding: '10px 14px',
            borderRadius: '8px',
            border: '1px solid rgba(248, 113, 113, 0.2)',
            backgroundColor: 'rgba(248, 113, 113, 0.06)',
            color: '#F87171',
            fontFamily: 'var(--font-body)',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.18s ease',
          }}
          className="sidebar-logout-btn"
        >
          <LogOut size={16} color="#F87171" />
          <span>Exit Portal (Logout)</span>
        </button>
      </div>

      <style>{`
        .sidebar-nav-btn:hover {
          background-color: rgba(255, 255, 255, 0.05) !important;
          color: var(--text-primary) !important;
        }
        .sidebar-logout-btn:hover {
          background-color: rgba(248, 113, 113, 0.15) !important;
          box-shadow: 0 0 12px rgba(248, 113, 113, 0.2) !important;
        }
        @media (max-width: 768px) {
          .defender-sidebar {
            display: none !important;
          }
        }
      `}</style>
    </aside>
  );
};

export default Sidebar;
