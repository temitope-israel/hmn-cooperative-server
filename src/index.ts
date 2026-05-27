// src/index.ts
// The entry point of the application, responsible for initializing the server and connecting to the database.
// This file starts the Express server and connects alll the pieces.
//

// Express is a minimal web framework for Node.js, used to create the server and define routes.
// It receives HTTP requests and sends responses back to the client. Or routes them to the right handler,
// and sends back a response.

import express from "express";
import cors from "cors";
import dotenv from "dotenv";

// Load environment variables from .env file
// It must be called before anything that reads process.env, so that the environment variables are available throughout the application.
dotenv.config();

// Create an instance of the Express application
const app = express();
const PORT = process.env.PORT ?? 3000;

// ==== Global Middleware ====
// Middleware runs on every request beofre it reaches the  route handlers. It can be used for tasks like parsing JSON, handling CORS, logging, etc.

// Cors() allows the frontend (localhost:5173) to make requests to this server.
// Without this, browsers would block requests from the frontend to the backend due to the Same-Origin Policy, which is a security feature that restricts how resources on a web page can be requested from another domain.
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? "https://hmn-cooperative.vercel.app"
        : "http://localhost:5173",
    credentials: true, // allows cookies and auth headers to be sent in cross-origin requests
  }),
);

// express.json() parses incoming JSON request bodies.
app.use(express.json());

// express.urlencoded() parses form-encoded data
app.use(express.urlencoded({ extended: true }));

// ==== Health check route ====
// A simple route to confirm the server is running.
// Used by deployement platforms to check if the app is healthy and running.
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    message: "HMN Cooperative API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
  });
});

// === API Routes ===

// === 404 Handler ===
// If no route matched, return a clear 404 error.
// The _ prefex on _req means "I know this parameter exists but I'm not using it"
// TypeScript requires this to avoid the noUnusedParameters error.
app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// === Global error handler ===
// Catches any error thrown inside route handlers.
// The 4-parameter signature is how Express recognises an error handler.
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
      success: false,
      message:
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : err.message, // in dev, show the actual error
    });
  },
);

// === Start the server
app.listen(PORT, () => {
  console.log(`
  ┌─────────────────────────────────────────┐
  │   HMN Cooperative API                   │
  │   Running on http://localhost:${PORT}   │
  │   Environment: ${process.env.NODE_ENV}  │
  └─────────────────────────────────────────┘
  `);
});

export default app;
