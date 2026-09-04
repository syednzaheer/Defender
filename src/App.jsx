import React, { useState } from 'react';
import CyberMeshBackground from './components/3d/CyberMeshBackground';
import Navbar from './components/layout/Navbar';
import MobileNav from './components/layout/MobileNav';
import Footer from './components/layout/Footer';
import Home from './pages/Home';

function App() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  return (
    <div className="defender-app" style={{ minHeight: '100vh', position: 'relative', backgroundColor: 'var(--bg-void)' }}>
      {/* 3D Undulating Wave Matrix Background */}
      <CyberMeshBackground />

      {/* Navigation Layer */}
      <Navbar onOpenMobileNav={() => setMobileNavOpen(true)} />
      <MobileNav isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

      {/* Content Layer */}
      <Home />

      {/* Footer Layer */}
      <Footer />
    </div>
  );
}

export default App;
