import { Router } from "express";
import { postController } from "../controllers/postController";
import { userController } from "../controllers/userController";
import { auth } from "../middlewares/auth";

export const router = Router();

router.get("/", postController.index);

router.get("/post/:id", postController.show);

router.get("/contact", userController.contact);

router.post("/contact", auth.authenticated, userController.handleContact);

// router.get("/captcha", userController.captcha);
