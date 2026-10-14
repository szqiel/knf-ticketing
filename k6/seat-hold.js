import http from "k6/http";
import { check, sleep } from "k6";

export const options = { scenarios: { holds: { executor: "constant-arrival-rate", rate: 5, timeUnit: "1s", duration: "30s", preAllocatedVUs: 10, maxVUs: 30 } } };
const baseUrl = __ENV.BASE_URL || "http://127.0.0.1:3000";
const programId = __ENV.PROGRAM_ID;

export default function () {
  if (!programId) return;
  const session = http.post(`${baseUrl}/api/booking/session`);
  check(session, { "session created": (response) => response.status === 201 });
  if (session.status !== 201) return;
  const token = session.json("sessionToken");
  const seats = http.get(`${baseUrl}/api/programs/${programId}/seats`);
  if (seats.status !== 200) return;
  const seat = seats.json("seats").find((candidate) => candidate.status === "available");
  if (!seat) return;
  const hold = http.post(`${baseUrl}/api/programs/${programId}/hold`, JSON.stringify({ seatId: seat.id, sessionToken: token }), { headers: { "Content-Type": "application/json" } });
  check(hold, { "hold returns expected status": (response) => [201, 409].includes(response.status) });
  sleep(1);
}
