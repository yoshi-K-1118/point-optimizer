import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import PointsManager from './pages/PointsManager';
import Strategy from './pages/Strategy';
import Alerts from './pages/Alerts';
import Simulator from './pages/Simulator';
import HowToUse from './pages/HowToUse';
import PointSites from './pages/PointSites';
import CreditCards from './pages/CreditCards';
import PointInvest from './pages/PointInvest';
import PointInvestSim from './pages/PointInvestSim';
import Disclaimer from './pages/Disclaimer';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import Campaigns from './pages/Campaigns';
import NotFound from './pages/NotFound';
import CookieBanner from './components/CookieBanner';
import { usePoints } from './hooks/usePoints';

export default function App() {
  const { points, updateBalance } = usePoints();

  return (
    <>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard points={points} />} />
          <Route path="/points" element={<PointsManager points={points} onUpdateBalance={updateBalance} />} />
          <Route path="/strategy" element={<Strategy />} />
          <Route path="/alerts" element={<Alerts points={points} />} />
          <Route path="/campaigns" element={<Campaigns />} />
          <Route path="/simulator" element={<Simulator />} />
          <Route path="/pointsites" element={<PointSites />} />
          <Route path="/cards" element={<CreditCards />} />
          <Route path="/invest" element={<PointInvest />} />
          <Route path="/invest-sim" element={<PointInvestSim />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/disclaimer" element={<Disclaimer />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/guide" element={<HowToUse />} />
          <Route path="/terms" element={<TermsOfService />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
      <CookieBanner />
    </>
  );
}
