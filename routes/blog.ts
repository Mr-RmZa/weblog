import { Router } from "express";
import { auth } from "../middlewares/auth";
import { postController } from "../controllers/postController";

export const routerBlog = Router();

routerBlog.get("/create", auth.authenticated, postController.index);

routerBlog.post("/create", postController.create);

routerBlog.post(
  "/upload-image",
  auth.authenticated,
  postController.uploadImage
);
