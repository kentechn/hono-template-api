import { describe, expect, it } from "vitest";
// If you have set up path aliases in tsconfig.json, ensure they are correctly configured.
// Otherwise, use a relative import path like below:
import app from "../../../src/app.js";

describe("Health Check Endpoint", () => {
  it("should return health status", async () => {
    const res = await app.request("/api/health", {
      method: "GET",
    });

    expect(res.status).toBe(200);

    const data = await res.json();
    expect(data).toEqual({
      status: "ok",
    });
  });
});
