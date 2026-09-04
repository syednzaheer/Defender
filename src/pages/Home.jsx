import React from 'react';
import HeroSection from '../components/sections/HeroSection';
import LogoTicker from '../components/sections/LogoTicker';
import IntroSection from '../components/sections/IntroSection';
import HowItWorksSection from '../components/sections/HowItWorksSection';
import FeaturesSection from '../components/sections/FeaturesSection';

const Home = () => {
  return (
    <main style={{ position: 'relative', zIndex: 1, minHeight: '100vh' }}>
      <HeroSection />
      <LogoTicker />
      <IntroSection />
      <HowItWorksSection />
      <FeaturesSection />
    </main>
  );
};

export default Home;
