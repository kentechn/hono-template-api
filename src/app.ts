import { Scalar } from "@scalar/hono-api-reference";
import { Hono } from "hono";
import { openAPISpecs } from "hono-openapi";
import healthRoute from "./presentation/routes/healthRoute.js";

const app = new Hono().basePath("/api");

app.route("/health", healthRoute);

app.get(
  "/openapi",
  openAPISpecs(app, {
    documentation: {
      info: {
        title: "Hono",
        version: "1.0.0",
        description: "API for todo application",
      },
      components: {
        securitySchemes: {
          bearerAuth: {
            type: "http",
            scheme: "bearer",
            bearerFormat: "JWT",
          },
        },
      },
      security: [
        {
          bearerAuth: [],
        },
      ],
      servers: [
        {
          url: "http://localhost:3000",
          description: "Local server",
        },
        {
          url: "https://api.example.com",
          description: "Production server",
        },
      ],
    },
  }),
);

app.get(
  "/docs",
  Scalar({
    theme: "saturn",
    url: "/api/openapi",
  }),
);

export default app;
