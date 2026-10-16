"use client";

import { useCallback, useEffect, useState } from "react";
import { seatMapResponseSchema, type Seat } from "@/lib/contracts";

type UseSeatMapDataOptions = {
  programSlug?: string;
  initialSeats: Seat[];
};

type SeatMapDataState = {
  seats: Seat[];
  programId: string | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
};

function getErrorMessage(payload: unknown) {
  if (typeof payload === "object" && payload !== null && "error" in payload && typeof payload.error === "string") {
    return payload.error;
  }
  return "Seat map is temporarily unavailable.";
}

export function useSeatMapData({ programSlug, initialSeats }: UseSeatMapDataOptions): SeatMapDataState {
  const [seats, setSeats] = useState(initialSeats);
  const [programId, setProgramId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(programSlug));
  const [error, setError] = useState<string | null>(null);

  const loadSeatMap = useCallback(async (signal?: AbortSignal) => {
    if (!programSlug) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/programs/by-slug/${encodeURIComponent(programSlug)}/seats`, {
        cache: "no-store",
        signal,
      });
      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) throw new Error(getErrorMessage(payload));

      const parsed = seatMapResponseSchema.safeParse(payload);
      if (!parsed.success) throw new Error("Seat map response is invalid.");

      setSeats(parsed.data.seats);
      setProgramId(parsed.data.programId);
      setError(null);
    } catch (loadError) {
      if (loadError instanceof DOMException && loadError.name === "AbortError") return;
      setError(loadError instanceof Error ? loadError.message : "Seat map is temporarily unavailable.");
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, [programSlug]);

  useEffect(() => {
    const controller = new AbortController();
    void loadSeatMap(controller.signal);
    return () => controller.abort();
  }, [loadSeatMap]);

  useEffect(() => {
    if (!programId) return;

    let eventSource: EventSource | null = null;
    let refreshTimer: number | undefined;

    const scheduleRefresh = () => {
      if (refreshTimer !== undefined) return;
      refreshTimer = window.setTimeout(() => {
        refreshTimer = undefined;
        void loadSeatMap();
      }, 80);
    };

    // Try EventSource
    try {
      eventSource = new EventSource(`/api/programs/${programId}/stream`);
      eventSource.addEventListener("seats_changed", scheduleRefresh);
      eventSource.onerror = () => {
        // SSE disconnected or unsupported on pooler; fallback polling guarantees fresh data
      };
    } catch {
      // EventSource not supported
    }

    // Resilient fallback polling: keeps seat holds & bookings in sync every 3.5s
    const pollInterval = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void loadSeatMap();
      }
    }, 3500);

    // Refresh immediately when returning to tab or unlocking mobile screen
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        void loadSeatMap();
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      if (eventSource) {
        eventSource.removeEventListener("seats_changed", scheduleRefresh);
        eventSource.close();
      }
      window.clearInterval(pollInterval);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      if (refreshTimer !== undefined) window.clearTimeout(refreshTimer);
    };
  }, [loadSeatMap, programId]);

  const refresh = useCallback(async () => {
    await loadSeatMap();
  }, [loadSeatMap]);

  return { seats, programId, isLoading, error, refresh };
}
