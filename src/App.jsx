import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import CyberBinaryBackground from './components/3d/CyberBinaryBackground';
import Sidebar from './components/layout/Sidebar';
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

const pageVariants = {
  initial: { opacity: 0, x: 12 },
  animate: { opacity: 1, x: 0, transition: { duration: 0.22, ease: 'easeOut' } },
  exit: { opacity: 0, x: -12, transition: { duration: 0.15, ease: 'easeIn' } },
};

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

  // Entry screen: no navbar/sidebar, full binary rain background
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
      {/* Universal Binary Digital Rain Background */}
      <CyberBinaryBackground />

      {/* Desktop Left Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Mobile Top Header */}
      <Navbar activeTab={activeTab} onTabChange={handleTabChange} onOpenMobileNav={() => setMobileNavOpen(true)} />
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} onTabChange={handleTabChange} />

      {/* Main Animated Content Area */}
      <main
        style={{
          position: 'relative',
          zIndex: 1,
          minHeight: '85vh',
          paddingTop: '60px',
          paddingLeft: '0px',
        }}
        className="defender-main-content"
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            style={{ width: '100%' }}
          >
            {activeTab === 'home' && <Home onTabChange={handleTabChange} />}
            {activeTab === 'demo' && <DemoRunnerSection onTabChange={handleTabChange} />}
            {activeTab === 'forecast' && <ForecastWorkspace autoRunDemo={false} />}
            {activeTab === 'how_it_works' && <HowItWorksSection onTabChange={handleTabChange} />}
            {activeTab === 'evidence' && <EvidenceSection />}
            {activeTab === 'technical' && <TechnicalDetailsSection />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Layer */}
      <div className="defender-footer-wrapper">
        <Footer onTabChange={handleTabChange} />
      </div>

      <style>{`
        @media (min-width: 769px) {
          .defender-main-content {
            padding-left: 250px !important;
            padding-top: 20px !important;
          }
          .defender-footer-wrapper {
            padding-left: 250px !important;
          }
        }
      `}</style>
    </div>
  );
}

export default App;
