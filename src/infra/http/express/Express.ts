import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";

// Stripe Webhook requires raw body. We must define it before express.json()
import WebhookController from "../controllers/WebhookController";
import AuthMiddleware from "../middlewares/AuthMiddleware";
import { globalLimiter } from "../middlewares/RateLimitMiddleware";
// Rotas de Admin
import AdminAuthRouter from "../routes/admin/AdminAuthRouter";
import AdminCustomerRouter from "../routes/admin/AdminCustomerRouter";
import AdminDashboardRouter from "../routes/admin/AdminDashboardRouter";
import AdminSpaceRouter from "../routes/admin/AdminSpaceRouter";
import AuthRouter from "../routes/AuthRouter";
import EventRouter from "../routes/EventRouter";
import ReviewReplyRouter from "../routes/ReviewReplyRouter";
import ReviewRouter from "../routes/ReviewRouter";
import SpacesRouter from "../routes/SpacesRouter";
import SubscriptionRouter from "../routes/SubscriptionRouter";
import UserRouter from "../routes/UserRouter";

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares globais
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true, // Permite envio de cookies
  })
);
app.post(
  "/webhooks/stripe",
  express.raw({ type: "application/json" }),
  WebhookController.handleStripeWebhook
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Middleware para ler cookies

app.use(globalLimiter); // Rate limiting global (1000 req/15min)

app.get("/health", (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Rotas públicas (não requerem autenticação)
app.use("/auth", AuthRouter);

// Rotas com autenticação gerenciada internamente por cada router
app.use("/api/user", UserRouter);
app.use("/api/spaces", SpacesRouter);
app.use("/api/listings", SpacesRouter); // Alias for compatibility
app.use("/api/subscription", SubscriptionRouter);
app.use("/api/reviews", ReviewRouter);
app.use("/api/events", EventRouter);
app.use("/api/reviews/replies", ReviewReplyRouter);

app.use("/api/admin/auth", AdminAuthRouter);
app.use("/api/admin/dashboard", AdminDashboardRouter);
app.use("/api/admin/users", AdminCustomerRouter);
app.use("/api/admin/ads", AdminSpaceRouter);

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
