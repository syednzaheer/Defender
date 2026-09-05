import React, { useState } from 'react';
import CyberBinaryBackground from './components/3d/CyberBinaryBackground';
import CyberMeshBackground from './components/3d/CyberMeshBackground';
import Navbar from './components/layout/Navbar';
import MobileNav from './components/layout/MobileNav';
import Footer from './components/layout/Footer';
import EntryPortal from './components/sections/EntryPortal';
import Home from './pages/Home';
import DemoRunnerSection from './components/sections/DemoRunnerSection';
import ForecastWorkspace from './components/sections/ForecastWorkspace';
import EvidenceSection from './components/sections/EvidenceSection';
import HowItWorksSection from './components/sections/HowItWorksSection';
import TechnicalDetailsSection from './components/sections/TechnicalDetailsSection';

function App() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('entry');
  // Tabs: 'entry' | 'home' | 'demo' | 'forecast' | 'how_it_works' | 'evidence' | 'technical'

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleEntryEnter = () => {
    setActiveTab('home');
  };

  // Entry screen: no navbar, no footer, just the portal + background
  if (activeTab === 'entry') {
    return (
      <div className="defender-app" style={{ minHeight: '100vh', position: 'relative', backgroundColor: '#05070A' }}>
        <CyberBinaryBackground />
        <EntryPortal onEnter={handleEntryEnter} />
      </div>
    );
  }

  return (
    <div className="defender-app" style={{ minHeight: '100vh', position: 'relative', backgroundColor: 'var(--bg-void)' }}>
      {/* Dynamic Cyber Mesh Background for application views */}
      <CyberMeshBackground />

      {/* Navigation Layer */}
      <Navbar activeTab={activeTab} onTabChange={handleTabChange} onOpenMobileNav={() => setMobileNavOpen(true)} />
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} onTabChange={handleTabChange} />

      {/* Main Content Area */}
      <main style={{ position: 'relative', zIndex: 1, minHeight: '80vh', paddingTop: '40px' }}>
        {activeTab === 'home' && <Home onTabChange={handleTabChange} />}
        {activeTab === 'demo' && <DemoRunnerSection onTabChange={handleTabChange} />}
        {activeTab === 'forecast' && <ForecastWorkspace autoRunDemo={false} />}
        {activeTab === 'how_it_works' && <HowItWorksSection onTabChange={handleTabChange} />}
        {activeTab === 'evidence' && <EvidenceSection />}
        {activeTab === 'technical' && <TechnicalDetailsSection />}
      </main>

      {/* Footer Layer */}
      <Footer onTabChange={handleTabChange} />
    </div>
  );
}

export default App;
