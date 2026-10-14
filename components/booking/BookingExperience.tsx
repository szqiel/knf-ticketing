"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  BOOKING_SESSION_STORAGE_KEY,
  bookingTicketStorageKey,
  bookingSessionSchema,
  bookingResponseSchema,
  holdResponseSchema,
  type BookingResponse,
  type HoldResponse,
  type Seat,
} from "@/lib/contracts";
import modalStyles from "./BookingModal.module.css";
import { NoSeatsModal } from "./NoSeatsModal";
import { SeatMap, type SeatMapProps } from "./SeatMap";
import { YourDetailsModal, type BookingDetails } from "./YourDetailsModal";
import { useSeatMapData } from "./useSeatMapData";

type BookingExperienceProps = {
  seats: Seat[];
  programSlug?: string;
  sessionToken?: string;
  onBookingDetails?: (seat: Seat, details: BookingDetails) => void | Promise<void>;
  onBookingComplete?: (booking: BookingResponse) => void | Promise<void>;
  seatMapProps?: Partial<Omit<SeatMapProps, "seats" | "selectedSeatId" | "onSelectSeat" | "onConfirm">>;
};

type ApiFailure = Error & { code?: string };
const SEAT_MAP_CONNECTION_ERROR = "Seat map belum terhubung ke database program.";
const SEAT_MAP_ACTIVE_STORAGE_KEY = "knf26.seat-map.active";

async function readApiResponse(response: Response) {
  const payload: unknown = await response.json().catch(() => null);
  if (response.ok) return payload;

  const failure = new Error(
    typeof payload === "object" && payload !== null && "error" in payload && typeof payload.error === "string"
      ? payload.error
      : "Booking request failed.",
  ) as ApiFailure;
  if (typeof payload === "object" && payload !== null && "code" in payload && typeof payload.code === "string") {
    failure.code = payload.code;
  }
  throw failure;
}

function formatHoldTime(seconds: number | null) {
  if (seconds === null) return "1 seat";
  return `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, "0")}`;
}

export function BookingExperience({
  seats: initialSeats,
  programSlug,
  sessionToken: initialSessionToken,
  onBookingDetails,
  onBookingComplete,
  seatMapProps,
}: BookingExperienceProps) {
  const seatMap = useSeatMapData({ programSlug, initialSeats });
  const router = useRouter();
  const seats = seatMap.seats;
  const [sessionToken, setSessionToken] = useState<string | null>(initialSessionToken ?? null);
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [noSeatsOpen, setNoSeatsOpen] = useState(false);
  const [activeHold, setActiveHold] = useState<HoldResponse | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState<number | null>(null);
  const [isHolding, setIsHolding] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState<string | null>(null);
  const activeHoldRef = useRef<HoldResponse | null>(null);
  const programIdRef = useRef<string | null>(null);
  const sessionTokenRef = useRef<string | null>(null);

  useEffect(() => {
    const navigationEntry = window.performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
    const wasAlreadyOnSeatMap = window.sessionStorage.getItem(SEAT_MAP_ACTIVE_STORAGE_KEY) === "true";

    if (navigationEntry?.type === "reload" && wasAlreadyOnSeatMap) {
      window.sessionStorage.removeItem(SEAT_MAP_ACTIVE_STORAGE_KEY);
      sessionTokenRef.current = null;
      window.sessionStorage.removeItem(BOOKING_SESSION_STORAGE_KEY);
      router.replace("/");
      return;
    }

    window.sessionStorage.setItem(SEAT_MAP_ACTIVE_STORAGE_KEY, "true");
    return () => window.sessionStorage.removeItem(SEAT_MAP_ACTIVE_STORAGE_KEY);
  }, [router]);

  useEffect(() => {
    if (initialSessionToken) {
      setSessionToken(initialSessionToken);
      window.sessionStorage.setItem(BOOKING_SESSION_STORAGE_KEY, initialSessionToken);
      return;
    }

    setSessionToken(window.sessionStorage.getItem(BOOKING_SESSION_STORAGE_KEY));
  }, [initialSessionToken]);

  useEffect(() => {
    activeHoldRef.current = activeHold;
  }, [activeHold]);

  useEffect(() => {
    programIdRef.current = seatMap.programId;
  }, [seatMap.programId]);

  useEffect(() => {
    sessionTokenRef.current = sessionToken;
  }, [sessionToken]);

  const releaseHold = useCallback(async (hold: HoldResponse | null) => {
    setActiveHold(null);
    setSecondsRemaining(null);

    if (!hold || !seatMap.programId || !sessionToken) return;

    try {
      await fetch(`/api/programs/${seatMap.programId}/hold`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          seatId: hold.seatId,
          holdToken: hold.holdToken,
          sessionToken,
        }),
        keepalive: true,
      });
    } catch {
      // Release is best effort; the database TTL remains authoritative.
    }
  }, [seatMap.programId, sessionToken]);

  const createBookingSession = useCallback(async () => {
    const response = await fetch("/api/booking/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
    const payload = await readApiResponse(response);
    const parsed = bookingSessionSchema.safeParse(payload);
    if (!parsed.success) throw new Error("Booking session response is invalid.");

    sessionTokenRef.current = parsed.data.sessionToken;
    setSessionToken(parsed.data.sessionToken);
    window.sessionStorage.setItem(BOOKING_SESSION_STORAGE_KEY, parsed.data.sessionToken);
    return parsed.data.sessionToken;
  }, []);

  const clearBookingSession = useCallback(() => {
    sessionTokenRef.current = null;
    setSessionToken(null);
    window.sessionStorage.removeItem(BOOKING_SESSION_STORAGE_KEY);
  }, []);

  const holdSeatWithSession = useCallback(async (seatId: string, token: string) => {
    if (!seatMap.programId) throw new Error(SEAT_MAP_CONNECTION_ERROR);

    const response = await fetch(`/api/programs/${seatMap.programId}/hold`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ seatId, sessionToken: token }),
    });
    const payload = await readApiResponse(response);
    const parsed = holdResponseSchema.safeParse(payload);
    if (!parsed.success) throw new Error("Hold response is invalid.");
    return parsed.data;
  }, [seatMap.programId]);

  useEffect(() => {
    return () => {
      const hold = activeHoldRef.current;
      const programId = programIdRef.current;
      const token = sessionTokenRef.current;
      if (!hold || !programId || !token) return;

      void fetch(`/api/programs/${programId}/hold`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ seatId: hold.seatId, holdToken: hold.holdToken, sessionToken: token }),
        keepalive: true,
      });
    };
  }, []);

  const selectedSeat = seats.find((seat) => seat.id === selectedSeatId) ?? null;
  const available = seats.some((seat) => seat.status === "available");

  useEffect(() => {
    if (selectedSeatId && !selectedSeat) setSelectedSeatId(null);
  }, [selectedSeat, selectedSeatId]);

  useEffect(() => {
    if (!seatMap.programId) return;

    setBookingError((currentError) => (
      currentError === SEAT_MAP_CONNECTION_ERROR ? null : currentError
    ));
  }, [seatMap.programId]);

  useEffect(() => {
    if (
      selectedSeat &&
      selectedSeat.status !== "available" &&
      !activeHold &&
      !isHolding
    ) {
      setSelectedSeatId(null);
      setBookingError("Kursi ini baru saja dipilih orang lain. Silakan pilih kursi lain.");
    }
  }, [activeHold, isHolding, selectedSeat]);

  const handleHoldExpired = useCallback(async () => {
    const hold = activeHold;
    if (!hold) return;
    await releaseHold(hold);
    setDetailsOpen(false);
    setSelectedSeatId(null);
    setBookingError("Waktu hold kursi habis. Silakan pilih kursi lagi.");
    await seatMap.refresh();
  }, [activeHold, releaseHold, seatMap.refresh]);

  useEffect(() => {
    if (!activeHold) {
      setSecondsRemaining(null);
      return;
    }

    const update = () => {
      const remaining = Math.max(0, Math.ceil((new Date(activeHold.expiresAt).getTime() - Date.now()) / 1000));
      setSecondsRemaining(remaining);
      if (remaining === 0) void handleHoldExpired();
    };

    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [activeHold, handleHoldExpired]);

  const handleSelectSeat = (seat: Seat) => {
    setBookingError(null);
    if (selectedSeatId === seat.id) {
      setSelectedSeatId(null);
      void releaseHold(activeHold);
      return;
    }

    if (activeHold) void releaseHold(activeHold);
    setSelectedSeatId(seat.id);
  };

  const handleConfirm = async () => {
    if (!selectedSeat || isHolding) return;
    if (!seatMap.programId) {
      setBookingError(SEAT_MAP_CONNECTION_ERROR);
      return;
    }
    setIsHolding(true);
    setBookingError(null);
    try {
      let activeSessionToken = sessionToken ?? await createBookingSession();
      let hold: HoldResponse;

      try {
        hold = await holdSeatWithSession(selectedSeat.id, activeSessionToken);
      } catch (error) {
        const failure = error as ApiFailure;
        if (failure.code !== "SESSION_INVALID") throw error;

        clearBookingSession();
        activeSessionToken = await createBookingSession();
        hold = await holdSeatWithSession(selectedSeat.id, activeSessionToken);
      }

      setActiveHold(hold);
      setDetailsOpen(true);
    } catch (error) {
      const failure = error as ApiFailure;
      setBookingError(
        failure.code === "SESSION_INVALID"
          ? "Session booking diperbarui. Silakan pilih kursi lagi."
          : failure.message || "Unable to hold that seat.",
      );
      await seatMap.refresh();
    } finally {
      setIsHolding(false);
    }
  };

  const submitDetails = async (details: BookingDetails) => {
    if (!selectedSeat || !activeHold || !seatMap.programId || !sessionToken || isSubmitting) return;

    setIsSubmitting(true);
    setBookingError(null);
    try {
      const idempotencyKey = typeof window.crypto.randomUUID === "function"
        ? window.crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      const response = await fetch(`/api/programs/${seatMap.programId}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          seatId: selectedSeat.id,
          holdToken: activeHold.holdToken,
          sessionToken,
          fullName: details.fullName,
          contact: details.contact,
          idempotencyKey,
        }),
      });
      const payload = await readApiResponse(response);
      const parsed = bookingResponseSchema.safeParse(payload);
      if (!parsed.success) throw new Error("Booking response is invalid.");

      const booking = parsed.data;
      try {
        window.sessionStorage.setItem(
          bookingTicketStorageKey(booking.bookingId),
          JSON.stringify(booking),
        );
      } catch (storageError) {
        console.warn("Unable to persist the ticket for the success page", storageError);
      }

      setDetailsOpen(false);
      setActiveHold(null);
      setSelectedSeatId(null);
      setBookingError(null);

      if (programSlug) router.push(`/p/${programSlug}/done/${booking.bookingId}`);

      void seatMap.refresh().catch((refreshError) => {
        console.error("Unable to refresh the seat map after booking", refreshError);
      });
      void Promise.resolve().then(async () => {
        await onBookingComplete?.(booking);
        try {
          await onBookingDetails?.(selectedSeat, details);
        } catch (callbackError) {
          console.error("Booking completion callback failed", callbackError);
        }
      }).catch((callbackError) => {
        console.error("Booking completion callback failed", callbackError);
      });
    } catch (error) {
      const failure = error as ApiFailure;
      if (failure.code === "SESSION_INVALID") {
        clearBookingSession();
        setDetailsOpen(false);
        setSelectedSeatId(null);
        setBookingError("Session booking sudah kedaluwarsa. Silakan pilih kursi lagi.");
        await seatMap.refresh();
        return;
      }

      setBookingError(failure.message || "Unable to confirm your booking.");
      if (failure.code === "HOLD_EXPIRED" || failure.code === "HOLD_INVALID") {
        await releaseHold(activeHold);
        setDetailsOpen(false);
        setSelectedSeatId(null);
        await seatMap.refresh();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const closeDetails = () => {
    if (isSubmitting) return;
    setDetailsOpen(false);
    setSelectedSeatId(null);
    void releaseHold(activeHold);
  };

  return (
    <>
      {bookingError && !detailsOpen && <p className={modalStyles.formError} role="alert">{bookingError}</p>}
      <SeatMap
        {...seatMapProps}
        seats={seats}
        selectedSeatId={selectedSeatId}
        onSelectSeat={handleSelectSeat}
        onConfirm={() => {
          if (!available) setNoSeatsOpen(true);
          else void handleConfirm();
        }}
        confirmButtonState={isHolding ? "disabled" : "active"}
        summaryCountLabel={isHolding ? "Holding…" : formatHoldTime(secondsRemaining)}
      />
      <YourDetailsModal
        open={detailsOpen}
        seatLabel={selectedSeat?.label ?? null}
        onClose={closeDetails}
        onSubmit={submitDetails}
        expiresInSeconds={secondsRemaining}
        error={bookingError}
        isSubmitting={isSubmitting}
      />
      <NoSeatsModal open={noSeatsOpen} onClose={() => setNoSeatsOpen(false)} />
    </>
  );
}
