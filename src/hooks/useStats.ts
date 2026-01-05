// Hook personalizado para estadísticas y datos globales apoyado en TanStack Query

import { useEffect, useRef } from "react";
import type { Stats } from "../types";
import {
  useBalance,
  useLastOrder,
  useStats as useStatsQuery,
} from "../services/api-query";

export function useStats(onShowToast: (message: string, type: string) => void) {
  const statsQuery = useStatsQuery({ retry: 1 });
  const balanceQuery = useBalance({ retry: 1 });
  const lastOrderQuery = useLastOrder({ retry: 1 });

  // Mostrar toast si hay error en cualquiera de las queries
  const errorShownRef = useRef(false);

  useEffect(() => {
  const hasError =
    statsQuery.isError ||
    balanceQuery.isError ||
    lastOrderQuery.isError;

  if (hasError && !errorShownRef.current) {
    onShowToast("Error al cargar datos", "error");
    errorShownRef.current = true;
  }

  if (!hasError) {
    errorShownRef.current = false;
  }
}, [
  statsQuery.isError,
  balanceQuery.isError,
  lastOrderQuery.isError,
  onShowToast,
]);
  const loadingServices =
    statsQuery.isLoading || balanceQuery.isLoading || lastOrderQuery.isLoading;

  const reloadData = () =>
    Promise.all([
      statsQuery.refetch(),
      balanceQuery.refetch(),
      lastOrderQuery.refetch(),
    ]);

  const defaultStats: Stats = {
    total_consultas: 0,
    sheet_existe: false,
    sheet_url: "",
  };

  return {
    stats: statsQuery.data ?? defaultStats,
    balance: balanceQuery.data ?? null,
    lastOrderInfo: lastOrderQuery.data ?? null,
    loadingServices,
    reloadData,
  };
}
