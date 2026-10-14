"use client";

import { useEffect, useState } from "react";
import type { Seat } from "@/lib/contracts";
import { NoSeatsModal } from "./NoSeatsModal";
import { SeatMap, type SeatMapProps } from "./SeatMap";
import { YourDetailsModal, type BookingDetails } from "./YourDetailsModal";
import { useSeatMapData } from "./useSeatMapData";

type BookingExperienceProps = {
  seats: Seat[];
  programSlug?: string;
  onBookingDetails?: (seat: Seat, details: BookingDetails) => void | Promise<void>;
  seatMapProps?: Partial<Omit<SeatMapProps, "seats" | "selectedSeatId" | "onSelectSeat" | "onConfirm">>;
};

export function BookingExperience({ seats: initialSeats, programSlug, onBookingDetails, seatMapProps }: BookingExperienceProps) {
  const seatMap = useSeatMapData({ programSlug, initialSeats });
  const seats = seatMap.seats;
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [noSeatsOpen, setNoSeatsOpen] = useState(false);

  const selectedSeat = seats.find((seat) => seat.id === selectedSeatId) ?? null;
  const available = seats.some((seat) => seat.status === "available");

  useEffect(() => {
    if (selectedSeatId && !selectedSeat) setSelectedSeatId(null);
  }, [selectedSeat, selectedSeatId]);

  const submitDetails = async (details: BookingDetails) => {
    if (!selectedSeat) return;
    setDetailsOpen(false);
    await onBookingDetails?.(selectedSeat, details);
  };

  return (
    <>
      <SeatMap
        {...seatMapProps}
        seats={seats}
        selectedSeatId={selectedSeatId}
        onSelectSeat={(seat) => setSelectedSeatId((currentSeatId) => currentSeatId === seat.id ? null : seat.id)}
        onConfirm={() => {
          if (!available) setNoSeatsOpen(true);
          else if (selectedSeat) setDetailsOpen(true);
        }}
      />
      <YourDetailsModal
        open={detailsOpen}
        seatLabel={selectedSeat?.label ?? null}
        onClose={() => setDetailsOpen(false)}
        onSubmit={submitDetails}
      />
      <NoSeatsModal open={noSeatsOpen} onClose={() => setNoSeatsOpen(false)} />
    </>
  );
}
