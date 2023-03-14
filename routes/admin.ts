import { Router } from "express";
import { schema } from "../models/User";

export const routerAdmin = Router();

routerAdmin.get("/", (req, res) => {
  res.render("admin", { pageTitle: "Dashboard" });
});

routerAdmin.get("/login", (req, res) => {
  res.render("login", { pageTitle: "Login" });
});

routerAdmin.get("/register", (req, res) => {
  res.render("register", { pageTitle: "Register" });
});

routerAdmin.post("/register", (req, res) => {
  schema
    .validate(req.body, { abortEarly: false })
    .then((result) => {
      console.log(result);
      res.redirect("/admin/login");
    })
    .catch((err) => {
      console.log(err.errors);
      res.render("register", { pageTitle: "register", errors: err.errors });
    });
});
