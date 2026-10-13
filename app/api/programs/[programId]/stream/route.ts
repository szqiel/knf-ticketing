import { getSql } from "@/lib/db/client";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ programId: string }> },
) {
  const { programId } = await params;
  const encoder = new TextEncoder();
  let closed = false;
  let heartbeat: ReturnType<typeof setInterval> | undefined;
  let listener: Awaited<ReturnType<ReturnType<typeof getSql>["listen"]>> | undefined;
  let controller: ReadableStreamDefaultController<Uint8Array> | undefined;

  const close = async () => {
    if (closed) return;
    closed = true;
    if (heartbeat) clearInterval(heartbeat);
    await listener?.unlisten();
    try {
      controller?.close();
    } catch {
      // The client may already have closed the stream.
    }
  };

  const stream = new ReadableStream<Uint8Array>({
    async start(streamController) {
      controller = streamController;
      const send = (event: string, data: unknown) => {
        if (!closed) controller?.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      send("ready", { programId });
      heartbeat = setInterval(() => send("heartbeat", { at: new Date().toISOString() }), 20_000);

      try {
        listener = await getSql().listen("seats_changed", (payload) => {
          try {
            const data = JSON.parse(payload) as { programId?: string; changedAt?: string };
            if (data.programId === programId) send("seats_changed", data);
          } catch {
            // Ignore malformed notifications and keep the stream alive.
          }
        });
      } catch (error) {
        console.error("Unable to subscribe to seat updates", error);
        send("error", { message: "Realtime updates are temporarily unavailable." });
      }

      request.signal.addEventListener("abort", () => void close(), { once: true });
    },
    cancel() {
      return close();
    },
  });

  return new Response(stream, {
    headers: {
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "Content-Type": "text/event-stream",
      "X-Accel-Buffering": "no",
    },
  });
}
