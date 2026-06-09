import dotenv from "dotenv";
// Inicializa o dotenv antes de importar o prisma
dotenv.config();

import express from "express";
import cors from "cors";
import helmet from "helmet";
import prisma from "./db/prisma.js";

const app = express();
const PORT = process.env.PORT || 3000;

// MIDDLEWARES:
app.use(cors());
app.use(helmet());
app.use(express.json());

// Rota de teste
app.get("/health", async (req, res) => {
  try {
    const citiesCount = await prisma.city.count();
    res.status(200).json({
      status: "OK",
      message: "Backend e Prisma conectados ao Neon com sucesso!",
      totalCidadesCadastradas: citiesCount,
    });
  } catch (error) {
    console.error("Erro ao conectar ao banco:", error);
    res.status(500).json({
      status: "ERROR",
      message: "Erro ao conectar ao banco de dados.",
      error: error.message,
    });
  }
});

// SERVER INIT:
app.listen(PORT, () => {
  console.log(`Server running at port ${PORT}`);
});
