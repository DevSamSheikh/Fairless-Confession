import express from "express";
import { registerRoutes } from "./routes";
import { pool } from "./db";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

(async () => {
  const server = await registerRoutes(app);

  const PORT = process.env.PORT || 3000;
  server.listen(Number(PORT), "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
})();
