ALTER TYPE "public"."reservation_status" ADD VALUE 'expired';--> statement-breakpoint
ALTER TYPE "public"."reservation_status" ADD VALUE 'released';--> statement-breakpoint
ALTER TYPE "public"."reservation_status" ADD VALUE 'cancelled';--> statement-breakpoint
ALTER TABLE "booking" ADD COLUMN "idempotency_key" text;--> statement-breakpoint
CREATE UNIQUE INDEX "booking_program_idempotency_key_idx" ON "booking" USING btree ("program_id","idempotency_key");