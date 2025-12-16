import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";

import AuthMiddleware from "../middlewares/AuthMiddleware";
import { globalLimiter } from "../middlewares/RateLimitMiddleware";
import AuthRouter from "../routes/AuthRouter";
import SpacesRouter from "../routes/SpacesRouter";
import SubscriptionRouter from "../routes/SubscriptionRouter";
import UserRouter from "../routes/UserRouter";

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globais
app.use(globalLimiter); // Rate limiting global (100 req/15min)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser()); // Middleware para ler cookies

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Rotas públicas (não requerem autenticação)
app.use("/auth", AuthRouter);

// Rotas com autenticação gerenciada internamente por cada router
app.use("/api/user", UserRouter);
app.use("/api/spaces", SpacesRouter);
app.use("/api/subscription", SubscriptionRouter);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err);

  if (err instanceof Error) {
    return res.status(400).json({ message: err.message });
  }

  return res.status(500).json({ error: "Internal Server Error" });
});

app.listen(PORT, () => {
  console.error(`Rodando na porta ${PORT}`);
});
