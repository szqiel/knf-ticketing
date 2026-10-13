"use client";

import { useState } from "react";
import type { Seat } from "@/lib/contracts";
import { NoSeatsModal } from "./NoSeatsModal";
import { SeatMap } from "./SeatMap";
import { YourDetailsModal, type BookingDetails } from "./YourDetailsModal";

type BookingExperienceProps = {
  seats: Seat[];
  onBookingDetails?: (seat: Seat, details: BookingDetails) => void | Promise<void>;
};

export function BookingExperience({ seats, onBookingDetails }: BookingExperienceProps) {
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [noSeatsOpen, setNoSeatsOpen] = useState(false);

  const selectedSeat = seats.find((seat) => seat.id === selectedSeatId) ?? null;
  const available = seats.some((seat) => seat.status === "available");

  const submitDetails = async (details: BookingDetails) => {
    if (!selectedSeat) return;
    setDetailsOpen(false);
    await onBookingDetails?.(selectedSeat, details);
  };

  return (
    <>
      <SeatMap
        seats={seats}
        selectedSeatId={selectedSeatId}
        onSelectSeat={(seat) => setSelectedSeatId(seat.id)}
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
