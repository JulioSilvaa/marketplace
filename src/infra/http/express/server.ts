import cors from "cors";
import express, { Express, Router } from "express";

export class MainServer {
  public app: Express;

  constructor() {
    this.app = express();
    this.middlewares();
  }

  private middlewares() {
    this.app.use(express.json());
    this.app.use(cors());
  }

  public routes(routes: Router) {
    this.app.use(routes);
  }

  public listen(port: number) {
    this.app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  }
}
