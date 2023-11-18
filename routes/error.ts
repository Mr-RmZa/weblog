import { Router } from "express";
import { errorController } from "../controllers/errorController";

export const routerError = Router();

routerError.get("/404", errorController[404]);

routerError.get("/500", errorController[500]);
