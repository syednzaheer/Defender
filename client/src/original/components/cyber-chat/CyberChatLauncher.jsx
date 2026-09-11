import { useState } from 'react';
import { X } from 'lucide-react';
import CyberChatSection from './CyberChatSection';

/**
 * Floating bottom-right CYPER launcher. Per the UI/UX consistency pass:
 * Cyber Chat must not compete with the hero CTA group or behave like a
 * normal workspace tab -- it overlays the page, everywhere, like a
 * conventional site chatbot.
 *
 * This component does not reimplement CYPER -- it renders the existing
 * CyberChatSection (in compact mode) inside a fixed-position panel. All
 * chat logic, the /api/v1/cyper/chat call, message state, and guide-step
 * state are exactly what they were before; only the container changed.
 */
export default function CyberChatLauncher({
  cyperContext,
  onTabChange,
  messages,
  onMessagesChange,
  guideStep,
  onGuideStepChange,
}) {
  const [open, setOpen] = useState(false);

  return (
    <div style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 500 }}>
      {open && (
        <div
          role="dialog"
          aria-label="CYPER Cyber Chat"
          style={{
            position: 'fixed',
            bottom: '96px',
            right: '24px',
            width: '400px',
            maxWidth: 'calc(100vw - 32px)',
            height: '600px',
            maxHeight: 'calc(100vh - 140px)',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--bg-void, #050507)',
            border: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
            borderRadius: '16px',
            boxShadow: '0 24px 64px rgba(0,0,0,0.55)',
            overflow: 'hidden',
          }}
        >
          <div style={{ flex: 1, overflow: 'hidden', display: 'flex' }}>
            <CyberChatSection
              compact
              cyperContext={cyperContext}
              onTabChange={onTabChange}
              messages={messages}
              onMessagesChange={onMessagesChange}
              guideStep={guideStep}
              onGuideStepChange={onGuideStepChange}
            />
          </div>
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-label={open ? 'Close CYPER chat' : 'Open CYPER chat'}
        style={{
          width: '56px',
          height: '56px',
          borderRadius: '50%',
          border: '1px solid #06B6D4',
          background: 'var(--bg-void, #050507)',
          color: '#06B6D4',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 0 24px rgba(6,182,212,0.28)',
          transition: 'transform 0.15s ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        {open ? <X size={22} /> : <img className="cyper-launcher-avatar" src="/manus-storage/cyper-bot-avatar-b_edd2eb24.png" alt="CYPER waving assistant" />}
      </button>
    </div>
  );
}
