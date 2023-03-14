import { Router } from "express";
import { object, string, number, date, InferType, ref } from "yup";

export const routerAdmin = Router();

const schema = object().shape({
  name: string()
    .required("full lname is required")
    .min(4, "full name minimum 4 character")
    .max(255, "full name maximum 255 character"),
  email: string().email("please enter email").required("email is required"),
  password: string()
    .required("password is required")
    .min(4, "password minimum 4 character")
    .max(255, "password maximum 255 character"),
  confirmPassword: string()
    .required("confirm password is required")
    .oneOf([ref("password")], "password does not match"),
});

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
    .validate(req.body)
    .then((result) => {
      console.log(result);
      res.redirect("/admin/login");
    })
    .catch((err) => {
      console.log(err.errors);
      res.render("register", { pageTitle: "register", errors: err.errors });
    });
});
