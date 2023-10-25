import { Router } from "express";
import { auth } from "../middlewares/auth";
import { userController } from "../controllers/userController";

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
