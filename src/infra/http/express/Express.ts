import cors from "cors";
import express, { NextFunction, Request, Response } from "express";

import UserRouter from "../routes/UserRouter";

const app = express();
const PORT = process.env.PORT;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

app.use("/api/user", UserRouter);

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
