import { User } from "../models/User";
import bcrypt from "bcryptjs";
import passport from "passport";
import { schema } from "../models/secure/userValidation";
import axios from "axios";

export class userController {
  public static login(
    req: { flash: (arg0: string) => any },
    res: {
      render: (
        arg0: string,
        arg1: { pageTitle: string; message: any; error: any }
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

  public static async handleLogin(req: any, res: any, next: any) {
    const GRR = req.body["g-recaptcha-response"];
    if (!GRR) {
      req.flash("error", "recaptcha is required");
      return res.redirect("/admin/login");
    }

    const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA}&response=${GRR}&remoteip=${req.connection.remoteAddress}`;
    const response = await axios.post(verifyUrl);

    if (response.data.success) {
      passport.authenticate("local", {
        failureRedirect: "/admin/login",
        failureFlash: true,
      })(req, res, next);
    } else {
      req.flash("error", "recaptcha error");
      res.redirect("/admin/login");
    }
  }

  public static rememberMe(
    req: {
      body: { remember: any };
      session: { cookie: { originalMaxAge: number; expires: null } };
    },
    res: any
  ) {
    if (req.body.remember) {
      req.session.cookie.originalMaxAge = 20 * 60 * 60 * 1000; // 1 day or 24 hour
    } else {
      req.session.cookie.expires = null;
    }
    res.redirect("/admin");
  }

  public static logout(
    req: { session: { destroy: (arg0: (err: any) => void) => void } },
    res: { redirect: (arg0: string) => void }
  ) {
    req.session.destroy(function (err: any) {
      res.redirect("/");
    });
  }

  public static async createUser(
    req: {
      body: { fullname: any; email: any; password: any };
      flash: (arg0: string, arg1: string) => void;
    },
    res: {
      render: (arg0: string, arg1: { pageTitle: string; errors?: any }) => any;
      redirect: (arg0: string) => void;
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
          bcrypt.hash(password, 10).then(async (res) => {
            await User.create({
              fullname,
              email,
              password: res,
            });
          });

          req.flash("success_msg", "register successfully!");

          res.redirect("/admin/login");
        })
        .catch((err: { errors: any }) => {
          console.log(err.errors);
          return res.render("register", {
            pageTitle: "register",
            errors: err.errors,
          });
        });
    } catch (error) {
      return res.render("/register", {
        pageTitle: "register",
      });
    }
  }
}
