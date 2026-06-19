import { useEffect, useRef } from "react";
import { refreshStore } from "@/src/store/refresh.store";

/**
 * Ejecuta el callback solo cuando `refreshTrigger` del store **aumenta** (refresh global).
 *
 * - No corre en el primer montaje (solo alinea el contador visto).
 * - No se re-ejecuta porque el contador siga > 0 mientras cambian otros stores.
 * - El callback puede cambiar cada render: se guarda en ref para no inflar dependencias.
 */
export function useOnRefreshTriggerIncrement(
  onIncrement: () => void | Promise<void>
): void {
  const handlerRef = useRef(onIncrement);
  handlerRef.current = onIncrement;
  const lastSeenRef = useRef<number | null>(null);
  const refreshTrigger = refreshStore((s) => s.refreshTrigger);

  useEffect(() => {
    if (lastSeenRef.current === null) {
      lastSeenRef.current = refreshTrigger;
      return;
    }
    if (refreshTrigger <= lastSeenRef.current) {
      if (refreshTrigger < lastSeenRef.current) {
        lastSeenRef.current = refreshTrigger;
      }
      return;
    }
    lastSeenRef.current = refreshTrigger;
    void Promise.resolve(handlerRef.current());
  }, [refreshTrigger]);
}
