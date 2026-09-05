import React, { useState } from 'react';
import CyberMeshBackground from './components/3d/CyberMeshBackground';
import Navbar from './components/layout/Navbar';
import MobileNav from './components/layout/MobileNav';
import Footer from './components/layout/Footer';
import Home from './pages/Home';
import ForecastWorkspace from './components/sections/ForecastWorkspace';
import EvidenceSection from './components/sections/EvidenceSection';
import HowItWorksSection from './components/sections/HowItWorksSection';

function App() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'forecast' | 'evidence' | 'how_it_works'

  const handleTabChange = (tabName) => {
    setActiveTab(tabName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="defender-app" style={{ minHeight: '100vh', position: 'relative', backgroundColor: 'var(--bg-void)' }}>
      {/* Dynamic Cyber Matrix Background */}
      <CyberMeshBackground />

      {/* Navigation Layer */}
      <Navbar activeTab={activeTab} onTabChange={handleTabChange} onOpenMobileNav={() => setMobileNavOpen(true)} />
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} onTabChange={handleTabChange} />

      {/* Main Content Area */}
      <main style={{ position: 'relative', zIndex: 1, minHeight: '80vh', paddingTop: '40px' }}>
        {activeTab === 'home' && <Home onTabChange={handleTabChange} />}
        {activeTab === 'forecast' && <ForecastWorkspace autoRunDemo={false} />}
        {activeTab === 'evidence' && <EvidenceSection />}
        {activeTab === 'how_it_works' && <HowItWorksSection onTabChange={handleTabChange} />}
      </main>

      {/* Footer Layer */}
      <Footer onTabChange={handleTabChange} />
    </div>
  );
}

export default App;
