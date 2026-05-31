/**
 * Integration tests for the Next.js API route handlers.
 * Mocks:
 *   - next/headers  → returns a unique test IP per call (avoids rate-limit collisions)
 *   - @/lib/securityHeaders → standard Response instead of NextResponse (no Next.js runtime needed)
 * GEMINI_API_KEY is intentionally absent so routes return deterministic mock data.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("next/headers", () => ({
  headers: vi.fn().mockImplementation(() =>
    Promise.resolve({
      get: () => `test-ip-${Math.random()}`,
    }),
  ),
}));

vi.mock("@/lib/securityHeaders", () => ({
  secureJson: (body: unknown, init?: { status?: number; headers?: Record<string, string> }) =>
    new Response(JSON.stringify(body), {
      status: init?.status ?? 200,
      headers: { "Content-Type": "application/json" },
    }),
  withSecurityHeaders: (res: Response) => res,
}));

// ---------------------------------------------------------------------------
// POST /api/analyze-dna
// ---------------------------------------------------------------------------

describe("POST /api/analyze-dna", () => {
  let POST: (req: Request) => Promise<Response>;

  beforeEach(async () => {
    delete process.env.GEMINI_API_KEY;
    const mod = await import("../analyze-dna/route");
    POST = mod.POST as (req: Request) => Promise<Response>;
  });

  it("returns 200 with mock analysis when no API key is set", async () => {
    const req = new Request("http://localhost/api/analyze-dna", {
      method: "POST",
      body: JSON.stringify({
        traits: { Adventure: 5, Food: 3, Culture: 8, Luxury: 1, Social: 2, Exploration: 6 },
      }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = (await res.json()) as { analysis: { title: string; summary: string } };
    expect(body.analysis).toHaveProperty("title");
    expect(body.analysis).toHaveProperty("summary");
  });

  it("returns 400 when traits object is missing", async () => {
    const req = new Request("http://localhost/api/analyze-dna", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
    const body = (await res.json()) as { error: string };
    expect(body).toHaveProperty("error");
  });

  it("returns 400 when body is not valid JSON", async () => {
    const req = new Request("http://localhost/api/analyze-dna", {
      method: "POST",
      body: "not-json",
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when traits is missing required keys", async () => {
    const req = new Request("http://localhost/api/analyze-dna", {
      method: "POST",
      body: JSON.stringify({ traits: { Adventure: 5 } }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });
});

// ---------------------------------------------------------------------------
// POST /api/generate-trip
// ---------------------------------------------------------------------------

describe("POST /api/generate-trip", () => {
  let POST: (req: Request) => Promise<Response>;

  beforeEach(async () => {
    delete process.env.GEMINI_API_KEY;
    const mod = await import("../generate-trip/route");
    POST = mod.POST as (req: Request) => Promise<Response>;
  });

  const validBody = {
    destination: "Tokyo",
    duration: 5,
    budget: "Moderate" as const,
    traits: { Adventure: 5, Food: 7, Culture: 8, Luxury: 1, Social: 2, Exploration: 6 },
  };

  it("returns 200 with mock trip data when no API key is set", async () => {
    const req = new Request("http://localhost/api/generate-trip", {
      method: "POST",
      body: JSON.stringify(validBody),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
    const body = (await res.json()) as {
      tripData: { personalityAnalysis: { title: string }; itinerary: { days: unknown[] } };
    };
    expect(body.tripData).toHaveProperty("personalityAnalysis.title");
    expect(body.tripData.itinerary.days.length).toBeGreaterThan(0);
  });

  it("returns 400 when destination is missing", async () => {
    const req = new Request("http://localhost/api/generate-trip", {
      method: "POST",
      body: JSON.stringify({ ...validBody, destination: "" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for an invalid budget enum value", async () => {
    const req = new Request("http://localhost/api/generate-trip", {
      method: "POST",
      body: JSON.stringify({ ...validBody, budget: "Expensive" }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 when body is not valid JSON", async () => {
    const req = new Request("http://localhost/api/generate-trip", {
      method: "POST",
      body: "{{bad",
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("accepts null traits (quiz not taken)", async () => {
    const req = new Request("http://localhost/api/generate-trip", {
      method: "POST",
      body: JSON.stringify({ ...validBody, traits: null }),
      headers: { "Content-Type": "application/json" },
    });
    const res = await POST(req);
    expect(res.status).toBe(200);
  });
});
