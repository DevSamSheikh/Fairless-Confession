import express, { type Request, type Response, type NextFunction } from "express";
import { setupAuth, registerAuthRoutes } from "./replit_integrations/auth";

export async function registerRoutes(app: express.Express) {
  // Set up authentication first
  await setupAuth(app);
  
  // Register auth-related API routes
  registerAuthRoutes(app);

  // Example protected route
  app.get("/api/protected-data", (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ message: "Not authenticated" });
    }
    res.json({ message: "This is protected data", user: req.user });
  });

  return app;
}
