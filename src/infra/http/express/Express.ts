import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";

// import { connectRedis } from "../../cache/redis"; // DESABILITADO TEMPORARIAMENTE
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

// Configura Express para confiar no primeiro proxy (Load Balancer do Render)
app.set("trust proxy", 1);

// Verificação de chaves do Stripe na inicialização
if (!process.env.STRIPE_SECRET_KEY) {
  console.warn("⚠️ ALERTA: STRIPE_SECRET_KEY não configurada no .env");
}
if (!process.env.STRIPE_WEBHOOK_SECRET) {
  console.warn("⚠️ ALERTA: STRIPE_WEBHOOK_SECRET não configurada no .env");
}

// Middlewares globais
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true, // Permite envio de cookies
  })
);

// Health check endpoint (must be before rate limiting to avoid deployment timeouts)
app.get(["/health", "/api/health"], (req: Request, res: Response) => {
  res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
});

// Compression middleware - deve vir antes do body-parser
app.use(
  compression({
    level: 6, // Nível de compressão (0-9)
    threshold: 1024, // Comprimir apenas se > 1KB
    filter: (req, res) => {
      if (req.headers["x-no-compression"]) {
        return false;
      }
      return compression.filter(req, res);
    },
  })
);

// Rota de Webhook do Stripe (deve vir antes do body-parser JSON)
// Suporta tanto /webhooks/stripe quanto /api/webhooks/stripe
app.post(
  ["/webhooks/stripe", "/api/webhooks/stripe"],
  express.raw({ type: "application/json" }),
  WebhookController.handleStripeWebhook
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Middleware para ler cookies

// Configura Express para confiar em proxies (necessário no Render)
app.set("trust proxy", true);

app.use(globalLimiter); // Rate limiting global (1000 req/15min)

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

// Initialize Redis and start server
const startServer = async () => {
  try {
    // Redis DESABILITADO temporariamente
    // await connectRedis().catch((err: Error) => {
    //   console.warn("⚠️  Failed to connect to Redis, continuing without cache:", err.message);
    // });

    app.listen(PORT, () => {
      console.error(`Rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
