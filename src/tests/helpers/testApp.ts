import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, Request, Response } from "express";

// Importar routers SEM rate limiting para testes
import { Router } from "express";
import ExpressAdapter from "../../infra/adapters/ExpressAdapter";
import AuthController from "../../infra/http/controllers/AuthController";
import UserController from "../../infra/http/controllers/UserController";
import SpaceController from "../../infra/http/controllers/SpaceController";
import SubscriptionController from "../../infra/http/controllers/SubscriptionController";
import AuthMiddleware from "../../infra/http/middlewares/AuthMiddleware";

// Criar routers sem rate limiting
const authRouter = Router();
authRouter.post("/login", ExpressAdapter.create(AuthController.login));
authRouter.post("/register", ExpressAdapter.create(AuthController.register));
authRouter.post("/refresh", ExpressAdapter.create(AuthController.refresh));
authRouter.post("/logout", ExpressAdapter.create(AuthController.logout));
authRouter.post("/forgot-password", ExpressAdapter.create(AuthController.forgotPassword));
authRouter.post("/reset-password", ExpressAdapter.create(AuthController.resetPassword));

const userRouter = Router();
userRouter.get("/search", ExpressAdapter.create(UserController.search));
userRouter.get("/", ExpressAdapter.create(UserController.getUsers));
userRouter.get("/:id", ExpressAdapter.create(UserController.findById));
userRouter.patch("/:id", AuthMiddleware.auth, ExpressAdapter.create(UserController.update));
userRouter.delete("/:id", AuthMiddleware.auth, ExpressAdapter.create(UserController.delete));

const spaceRouter = Router();
const subscriptionRouter = Router();

export function createTestApp() {
  const app = express();

  // Middlewares globais
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cors());
  app.use(cookieParser());

  // ⚠️ NÃO usar rate limiting em testes (causa 429 errors)
  // Rate limiting deve ser habilitado apenas em produção

  app.get("/health", (req: Request, res: Response) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Rotas SEM rate limiting
  app.use("/auth", authRouter);
  app.use("/api/user", userRouter);
  app.use("/api/spaces", spaceRouter);
  app.use("/api/subscription", subscriptionRouter);

  // Error handler
  app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err);

    if (err instanceof Error) {
      return res.status(400).json({ message: err.message });
    }

    return res.status(500).json({ error: "Internal Server Error" });
  });

  return app;
}
