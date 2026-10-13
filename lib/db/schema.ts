import {
  boolean,
  date,
  integer,
  pgEnum,
  pgTable,
  real,
  text,
  time,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

export const reservationStatus = pgEnum("reservation_status", ["held", "booked"]);
export const bookingStatus = pgEnum("booking_status", ["booked", "cancelled"]);
export const bookingSource = pgEnum("booking_source", ["kiosk", "phone"]);
export const sessionSource = pgEnum("session_source", ["qr", "kiosk"]);

export const programs = pgTable(
  "program",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: text("slug").notNull(),
    title: text("title").notNull(),
    subtitle: text("subtitle"),
    description: text("description"),
    posterPath: text("poster_path"),
    showDate: date("show_date"),
    startsAt: time("starts_at"),
    endsAt: time("ends_at"),
    dayLabel: text("day_label"),
    sortOrder: integer("sort_order").notNull().default(0),
    isPublished: boolean("is_published").notNull().default(false),
    bookingOpen: boolean("booking_open").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("program_slug_idx").on(table.slug)],
);

export const films = pgTable(
  "film",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    programId: uuid("program_id")
      .notNull()
      .references(() => programs.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    director: text("director"),
    durationMin: integer("duration_min"),
    origin: text("origin"),
    synopsis: text("synopsis"),
    posterPath: text("poster_path"),
    stillPath: text("still_path"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("film_program_order_idx").on(table.programId, table.sortOrder)],
);

export const seats = pgTable("seat", {
  id: text("id").primaryKey(),
  label: text("label").notNull(),
  block: text("block").notNull(),
  rowName: text("row_name").notNull(),
  number: integer("number").notNull(),
  x: real("x").notNull(),
  y: real("y").notNull(),
  rotation: real("rotation").notNull().default(0),
});

export const bookingSessions = pgTable(
  "booking_session",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    tokenHash: text("token_hash").notNull(),
    source: sessionSource("source").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    revokedAt: timestamp("revoked_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("booking_session_token_hash_idx").on(table.tokenHash)],
);

export const bookings = pgTable("booking", {
  id: uuid("id").defaultRandom().primaryKey(),
  programId: uuid("program_id")
    .notNull()
    .references(() => programs.id, { onDelete: "restrict" }),
  fullName: text("full_name").notNull(),
  contact: text("contact").notNull(),
  source: bookingSource("source").notNull(),
  status: bookingStatus("status").notNull().default("booked"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
  cancelledReason: text("cancelled_reason"),
});

export const blockedSeats = pgTable(
  "blocked_seat",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    programId: uuid("program_id")
      .notNull()
      .references(() => programs.id, { onDelete: "cascade" }),
    seatId: text("seat_id")
      .notNull()
      .references(() => seats.id, { onDelete: "restrict" }),
    reason: text("reason"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [uniqueIndex("blocked_program_seat_idx").on(table.programId, table.seatId)],
);

export const reservations = pgTable(
  "reservation",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    programId: uuid("program_id")
      .notNull()
      .references(() => programs.id, { onDelete: "cascade" }),
    seatId: text("seat_id")
      .notNull()
      .references(() => seats.id, { onDelete: "restrict" }),
    status: reservationStatus("status").notNull(),
    holdToken: uuid("hold_token"),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    bookingId: uuid("booking_id").references(() => bookings.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("reservation_program_seat_idx").on(table.programId, table.seatId),
    uniqueIndex("reservation_hold_token_idx").on(table.holdToken),
  ],
);

export type Program = typeof programs.$inferSelect;
export type Film = typeof films.$inferSelect;
export type Seat = typeof seats.$inferSelect;
export type Booking = typeof bookings.$inferSelect;
export type Reservation = typeof reservations.$inferSelect;
