import * as v from "valibot";

export const HealthResponseSchema = v.object({
  status: v.literal("ok"),
});
