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
import { usePoints } from './hooks/usePoints';

export default function App() {
  const { points, updateBalance } = usePoints();

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard points={points} />} />
        <Route path="/points" element={<PointsManager points={points} onUpdateBalance={updateBalance} />} />
        <Route path="/strategy" element={<Strategy points={points} />} />
        <Route path="/alerts" element={<Alerts points={points} />} />
        <Route path="/simulator" element={<Simulator />} />
        <Route path="/pointsites" element={<PointSites />} />
        <Route path="/cards" element={<CreditCards />} />
        <Route path="/guide"     element={<HowToUse />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </Layout>
  );
}
