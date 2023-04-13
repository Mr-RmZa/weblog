import { Router } from "express";
import { postController } from "../controllers/postController";
import { auth } from "../middlewares/auth";

export const routerBlog = Router();

routerBlog.get("/create", auth.authenticated, postController.index);

routerBlog.post("/create", postController.create);
