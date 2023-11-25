import { Router } from "express";
import { auth } from "../middlewares/auth";
import { postController } from "../controllers/postController";
import { userController } from "../controllers/userController";

export const router = Router();

router.get("/", postController.index);

router.get("/post/:id", postController.show);

router.get("/contact", userController.contact);

router.post("/contact", auth.authenticated, userController.handleContact);

router.get("/captcha", userController.captcha);

router.get("/search", auth.authenticated, postController.search);
