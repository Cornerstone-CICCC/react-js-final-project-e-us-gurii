import dotenv from "dotenv";

dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import prisma from "./db/prisma.js";
import authRoutes from "./routes/authRoutes.js";
import tripRoutes from "./routes/tripRoutes.js";

const app = express();
const PORT = process.env.PORT || 3000;

// MIDDLEWARES:
app.use(cors());
app.use(helmet());
app.use(express.json());

// ROUTES:
app.use("/api/auth", authRoutes); // LOGIN
app.use("/api/trips", tripRoutes); // TRIPS

app.get("/health", async (req, res) => {
  try {
    const citiesCount = await prisma.city.count();
    res.status(200).json({
      status: "OK",
      message: "Backend and Prisma have successfully connected to Neon!",
      totalCidadesCadastradas: citiesCount,
    });
  } catch (error) {
    console.error("Error connecting to the database:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Error connecting to the database:",
      error: error.message,
    });
  }
});

// SERVER INIT:
app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});
