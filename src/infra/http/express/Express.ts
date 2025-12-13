import cors from "cors";
import express, { NextFunction, Request, Response } from "express";

import SpacesRouter from "../routes/SpacesRouter";
import SubscriptionRouter from "../routes/SubscriptionRouter";
import UserRouter from "../routes/UserRouter";

const app = express();
const PORT = process.env.PORT || 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

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
  console.log(`Rodando na porta ${PORT}`);
});
