// Hook personalizado para estadísticas y datos globales

import { useState, useEffect } from "react";
import type { Stats, LastOrderInfo } from "../types";
import { IMEIAPIService } from "../services/api";

export function useStats(onShowToast: (message: string, type: string) => void) {
  const [stats, setStats] = useState<Stats>({
    total_consultas: 0,
    sheet_existe: false,
    sheet_url: "",
  });
  const [balance, setBalance] = useState<number | null>(null);
  const [lastOrderInfo, setLastOrderInfo] = useState<LastOrderInfo | null>(null);
  const [loadingServices, setLoadingServices] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoadingServices(true);
      
      const [statsData, balanceData, orderData] = await Promise.all([
        IMEIAPIService.getStats(),
        IMEIAPIService.getBalance(),
        IMEIAPIService.getLastOrder(),
      ]);

      setStats(statsData);
      setBalance(balanceData);
      setLastOrderInfo(orderData);
    } catch (error) {
      console.error("Error al cargar datos:", error);
      onShowToast("Error al cargar datos", "error");
    } finally {
      setLoadingServices(false);
    }
  };

  return { stats, balance, lastOrderInfo, loadingServices, reloadData: loadData };
}
