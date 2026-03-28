import { useLocalStorage } from './useLocalStorage';
import { POINT_PROGRAMS } from '../data/pointPrograms';

const initialPoints = POINT_PROGRAMS.map((p) => ({
  programId: p.id,
  balance: 0,
  lastUpdated: new Date().toISOString(),
  expiringPoints: 0,
  expiryDate: null,
  history: [],
}));

export function usePoints() {
  const [points, setPoints] = useLocalStorage('point-optimizer-balances', initialPoints);

  const updateBalance = (programId, balance, expiringPoints = 0, expiryDate = null) => {
    setPoints((prev) =>
      prev.map((p) =>
        p.programId === programId
          ? {
              ...p,
              balance: Number(balance),
              expiringPoints: Number(expiringPoints),
              expiryDate,
              lastUpdated: new Date().toISOString(),
              history: [
                ...p.history.slice(-29),
                { date: new Date().toISOString(), balance: Number(balance) },
              ],
            }
          : p
      )
    );
  };

  const getTotalJpy = () => {
    return points.reduce((sum, p) => {
      const program = POINT_PROGRAMS.find((prog) => prog.id === p.programId);
      return sum + p.balance * (program?.exchangeRateToJpy ?? 1);
    }, 0);
  };

  const getExpiringWithin = (days) => {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() + days);
    return points.filter(
      (p) => p.expiryDate && new Date(p.expiryDate) <= cutoff && p.expiringPoints > 0
    );
  };

  return { points, updateBalance, getTotalJpy, getExpiringWithin };
}
