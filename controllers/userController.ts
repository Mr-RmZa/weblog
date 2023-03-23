import { object, ref, string } from "yup";
import { User } from "../models/User";
import bcrypt from "bcryptjs";
import passport from "passport";

export class userController {
  public static login(
    req: any,
    res: {
      render: (
        arg0: string,
        arg1: { pageTitle: string; message: string; error: string }
      ) => void;
    }
  ) {
    res.render("login", {
      pageTitle: "Login",
      message: req.flash("success_msg"),
      error: req.flash("error"),
    });
  }

  public static register(
    req: any,
    res: { render: (arg0: string, arg1: { pageTitle: string }) => void }
  ) {
    res.render("register", { pageTitle: "Register" });
  }

  public static handleLogin(req: any, res: any, next: any) {
    passport.authenticate("local", {
      successRedirect: "/admin",
      failureRedirect: "admin/login",
      failureFlash: true,
    })(req, res, next);
  }

  public static async createUser(
    req: {
      flash(arg0: string, arg1: string): unknown;
      body: any;
    },
    res: {
      redirect: (arg0: string) => void;
      render: (arg0: string, arg1: { pageTitle: string; errors?: any }) => void;
    }
  ) {
    const errors = [];

    try {
      const { fullname, email, password } = req.body;
      const user = await User.findOne({ email });
      if (user) {
        errors.push("Duplicate email");
        return res.render("register", {
          pageTitle: "Register",
          errors,
        });
      }

      schema
        .validate(req.body, { abortEarly: false })
        .then((result: any) => {
          console.log(result);
          res.redirect("/admin/login");
        })
        .catch((err: { errors: any }) => {
          console.log(err.errors);
          res.render("register", { pageTitle: "register", errors: err.errors });
        });

      bcrypt.hash(password, 10).then(async (res) => {
        await User.create({
          fullname,
          email,
          password: res,
        });
      });
      req.flash("success_msg", "register successfully!");
      res.redirect("/admin/login");
    } catch (error) {
      return res.render("/register", {
        pageTitle: "register",
      });
    }
  }
}

export const schema = object().shape({
  fullname: string()
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
