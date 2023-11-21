import { Router } from "express";
import { auth } from "../middlewares/auth";
import { userController } from "../controllers/userController";

export const routerAdmin = Router();

routerAdmin.get("/", auth.authenticated, userController.dashboard);

routerAdmin.get("/login", userController.login);

routerAdmin.post(
  "/login",
  userController.recaptcha,
  userController.rememberMe
);

routerAdmin.get("/logout", auth.authenticated, userController.logout);

routerAdmin.get("/register", userController.register);

routerAdmin.post(
  "/register",
  userController.recaptcha,
  userController.createUser
);

routerAdmin.get("/forgetPassword", userController.forgetPassword);

routerAdmin.post(
  "/forgetPassword",
  userController.recaptcha,
  userController.handleForgetPassword
);

routerAdmin.get("/resetPassword/:token", userController.resetPassword);

routerAdmin.post("/resetPassword/:id", userController.handleResetPassword);
