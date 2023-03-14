import { Router } from "express";
import { schema, userController } from "../controllers/userController";

export const routerAdmin = Router();

routerAdmin.get("/", (req, res) => {
  res.render("admin", { pageTitle: "Dashboard" });
});

routerAdmin.get("/login", userController.login);

routerAdmin.get("/register", userController.register);

routerAdmin.post("/register", userController.registerPost);
