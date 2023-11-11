import { Router } from "express";
import { auth } from "../middlewares/auth";
import { postController } from "../controllers/postController";

export const routerBlog = Router();

routerBlog.get("/create", auth.authenticated, postController.create);

routerBlog.post("/create", auth.authenticated, postController.store);

routerBlog.get("/edit/:id", auth.authenticated, postController.edit);

routerBlog.post("/edit/:id", auth.authenticated, postController.update);

routerBlog.get("/delete/:id", auth.authenticated, postController.delete);

routerBlog.post("/upload", auth.authenticated, postController.upload);
