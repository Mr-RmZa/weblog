import { User } from "../models/User";
import bcrypt from "bcryptjs";
import passport from "passport";
import { schema } from "../models/secure/userValidation";

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
      // successRedirect: "/admin",
      failureRedirect: "/admin/login",
      failureFlash: true,
    })(req, res, next);
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
