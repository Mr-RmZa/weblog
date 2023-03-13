import { Router } from "express";
import { object, string, number, date, InferType, ref } from "yup";

export const routerAdmin = Router();

const schema = object().shape({
  fullname: string().required().min(4).max(255),
  email: string().email().required(),
  password: string()
    .required()
    .oneOf([ref("password")]),
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
  const validator = schema.isValid(req.body);
  validator
    .then((result) => {
      console.log(result);
      if (result === true) {
        res.send("all good");
      } else {
        res.send("error");
      }
    })
    .catch((ex) => {
      console.log(ex);
      res.send("Error");
    });
});
