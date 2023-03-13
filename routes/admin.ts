import { Router } from "express";

export const routerAdmin = Router();

routerAdmin.get("/", (req, res) => {
  res.render("admin", { pageTitle: "Dashboard" });
});

routerAdmin.get("/login", (req, res) => {
  res.render("login", { pageTitle: "Login" });
});