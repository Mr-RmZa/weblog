import { Router } from "express";
import { userController } from "../controllers/userController";
import { auth } from "../middlewares/auth";

export const routerAdmin = Router();

routerAdmin.get("/", auth.authenticated, userController.dashboard);

routerAdmin.get("/login", userController.login);

routerAdmin.post(
  "/login",
  userController.handleLogin,
  userController.rememberMe
);

routerAdmin.get("/logout", auth.authenticated, userController.logout);

routerAdmin.get("/register", userController.register);

routerAdmin.post("/register", userController.createUser);
