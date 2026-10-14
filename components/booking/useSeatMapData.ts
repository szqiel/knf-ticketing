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

  const refresh = useCallback(async () => {
    await loadSeatMap();
  }, [loadSeatMap]);

  return { seats, programId, isLoading, error, refresh };
}
