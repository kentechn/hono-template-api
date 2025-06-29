import { Hono } from "hono";
import { healthDescribeRoute } from "../openapi/index.js";

const healthRoute = new Hono();

healthRoute.get("/", healthDescribeRoute, (c) => {
  console.log("Health check endpoint hit");
  return c.json({
    status: "ok",
  });
});

export default healthRoute;
