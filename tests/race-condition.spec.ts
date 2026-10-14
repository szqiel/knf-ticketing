import { test, expect } from "@playwright/test";

test("only one concurrent hold wins the same seat", async ({ request }) => {
  test.skip(!process.env.RUN_E2E || !process.env.PROGRAM_ID, "Set RUN_E2E=1 and PROGRAM_ID for race testing.");
  const programId = process.env.PROGRAM_ID!;
  const [sessionA, sessionB, seatMap] = await Promise.all([
    request.post("/api/booking/session"), request.post("/api/booking/session"), request.get(`/api/programs/${programId}/seats`),
  ]);
  expect(sessionA.ok()).toBeTruthy(); expect(sessionB.ok()).toBeTruthy(); expect(seatMap.ok()).toBeTruthy();
  const tokenA = (await sessionA.json()).sessionToken; const tokenB = (await sessionB.json()).sessionToken;
  const seat = (await seatMap.json()).seats.find((candidate: { status: string; id: string }) => candidate.status === "available");
  expect(seat).toBeTruthy();
  const [a, b] = await Promise.all([tokenA, tokenB].map((sessionToken) => request.post(`/api/programs/${programId}/hold`, { data: { seatId: seat.id, sessionToken } })));
  expect([a.status(), b.status()].filter((status) => status === 201)).toHaveLength(1);
  expect([a.status(), b.status()].filter((status) => status === 409)).toHaveLength(1);
  const winnerIndex = [a, b].findIndex((response) => response.status() === 201);
  const winner = [a, b][winnerIndex];
  const winnerBody = await winner.json();
  await request.delete(`/api/programs/${programId}/hold`, { data: { seatId: seat.id, holdToken: winnerBody.holdToken, sessionToken: [tokenA, tokenB][winnerIndex] } });
});
