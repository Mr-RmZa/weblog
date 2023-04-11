import { User } from "../models/User";
import bcrypt from "bcryptjs";
import passport from "passport";
import { schema } from "../models/secure/userValidation";
import axios from "axios";

export class userController {
  public static dashboard(
    req: { flash: (arg0: string) => any },
    res: {
      render: (
        arg0: string,
        arg1: { pageTitle: string; message: any; error: any }
      ) => void;
    }
  ) {
    res.render("admin", {
      pageTitle: "Dashboard",
      message: req.flash("success_msg"),
      error: req.flash("error"),
    });
  }

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
    req: { flash: (arg0: string) => any },
    res: {
      render: (
        arg0: string,
        arg1: { pageTitle: string; message: any; error: any }
      ) => void;
    }
  ) {
    res.render("register", {
      pageTitle: "Register",
      message: req.flash("success_msg"),
      error: req.flash("error"),
    });
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
      flash(arg0: string, arg1: string): unknown;
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
    req.flash("error", "login was successfully");
    res.redirect("/admin");
  }

  public static logout(
    req: {
      logout: (arg0: (err: any) => any) => void;
      flash: (arg0: string, arg1: string) => void;
    },
    res: { redirect: (arg0: string) => void },
    next: (arg0: any) => any
  ) {
    req.logout((err: any) => {
      if (err) {
        return next(err);
      }
      req.flash("success_msg", "logout was successfully");
      res.redirect("/");
    });
  }

  public static async createUser(
    req: {
      body: { fullname: any; email: any; password: any };
      flash: (arg0: string, arg1: string) => void;
    },
    res: { redirect: (arg0: string) => void }
  ) {
    try {
      const { fullname, email, password } = req.body;
      const user = await User.findOne({ email });
      if (user) {
        req.flash("error", "Duplicate Email!");
        res.redirect("/admin/register");
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
          req.flash("error", err.errors);
          res.redirect("/admin/register");
        });
    } catch (error) {
      res.redirect("/admin/register");
    }
  }
}
