import { Router } from "express";
import { postController } from "../controllers/postController";
import { auth } from "../middlewares/auth";

export const routerBlog = Router();

routerBlog.get("/create", auth.authenticated,postController.create);
