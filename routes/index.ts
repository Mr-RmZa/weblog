import { Router } from "express";
import { postController } from "../controllers/postController";

export const router = Router();

router.get("/", postController.index);

router.get("/post/:id", postController.show);
