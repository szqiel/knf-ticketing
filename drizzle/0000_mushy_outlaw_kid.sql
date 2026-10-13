CREATE TYPE "public"."booking_source" AS ENUM('kiosk', 'phone');--> statement-breakpoint
CREATE TYPE "public"."booking_status" AS ENUM('booked', 'cancelled');--> statement-breakpoint
CREATE TYPE "public"."reservation_status" AS ENUM('held', 'booked');--> statement-breakpoint
CREATE TYPE "public"."session_source" AS ENUM('qr', 'kiosk');--> statement-breakpoint
CREATE TABLE "blocked_seat" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program_id" uuid NOT NULL,
	"seat_id" text NOT NULL,
	"reason" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booking_session" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"token_hash" text NOT NULL,
	"source" "session_source" NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"revoked_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "booking" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program_id" uuid NOT NULL,
	"full_name" text NOT NULL,
	"contact" text NOT NULL,
	"source" "booking_source" NOT NULL,
	"status" "booking_status" DEFAULT 'booked' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"cancelled_at" timestamp with time zone,
	"cancelled_reason" text
);
--> statement-breakpoint
CREATE TABLE "film" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program_id" uuid NOT NULL,
	"title" text NOT NULL,
	"director" text,
	"duration_min" integer,
	"origin" text,
	"synopsis" text,
	"poster_path" text,
	"still_path" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "program" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"subtitle" text,
	"description" text,
	"poster_path" text,
	"show_date" date,
	"starts_at" time,
	"ends_at" time,
	"day_label" text,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"is_published" boolean DEFAULT false NOT NULL,
	"booking_open" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reservation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"program_id" uuid NOT NULL,
	"seat_id" text NOT NULL,
	"status" "reservation_status" NOT NULL,
	"hold_token" uuid,
	"expires_at" timestamp with time zone,
	"booking_id" uuid,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "seat" (
	"id" text PRIMARY KEY NOT NULL,
	"label" text NOT NULL,
	"block" text NOT NULL,
	"row_name" text NOT NULL,
	"number" integer NOT NULL,
	"x" real NOT NULL,
	"y" real NOT NULL,
	"rotation" real DEFAULT 0 NOT NULL
);
--> statement-breakpoint
ALTER TABLE "blocked_seat" ADD CONSTRAINT "blocked_seat_program_id_program_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."program"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "blocked_seat" ADD CONSTRAINT "blocked_seat_seat_id_seat_id_fk" FOREIGN KEY ("seat_id") REFERENCES "public"."seat"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "booking" ADD CONSTRAINT "booking_program_id_program_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."program"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "film" ADD CONSTRAINT "film_program_id_program_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."program"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_program_id_program_id_fk" FOREIGN KEY ("program_id") REFERENCES "public"."program"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_seat_id_seat_id_fk" FOREIGN KEY ("seat_id") REFERENCES "public"."seat"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservation" ADD CONSTRAINT "reservation_booking_id_booking_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."booking"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "blocked_program_seat_idx" ON "blocked_seat" USING btree ("program_id","seat_id");--> statement-breakpoint
CREATE UNIQUE INDEX "booking_session_token_hash_idx" ON "booking_session" USING btree ("token_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "film_program_order_idx" ON "film" USING btree ("program_id","sort_order");--> statement-breakpoint
CREATE UNIQUE INDEX "program_slug_idx" ON "program" USING btree ("slug");--> statement-breakpoint
CREATE UNIQUE INDEX "reservation_program_seat_idx" ON "reservation" USING btree ("program_id","seat_id");--> statement-breakpoint
CREATE UNIQUE INDEX "reservation_hold_token_idx" ON "reservation" USING btree ("hold_token");