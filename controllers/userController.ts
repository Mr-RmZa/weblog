import axios from "axios";
import bcrypt from "bcryptjs";
import passport from "passport";
import { User } from "../models/User";
import { Blog } from "../models/Blog";
import { formatDate } from "../utils/jalali";
import { schemaUser } from "../models/secure/userValidation";

export class userController {
  public static async dashboard(
    req: any,
    res: {
      redirect(arg0: string): unknown;
      render: (
        arg0: string,
        arg1: {
          pageTitle: string;
          message: any;
          error: any;
          name: string;
          blogs: any;
          formatDate: any;
          currentPage: number;
          nextPage: number;
          previousPage: number;
          hasNextPage: boolean;
          hasPreviousPage: boolean;
          lastPage: number;
        }
      ) => void;
    }
  ) {
    const page = +req.query.page || 1;
    const postPerPage = 2;
    try {
      const numberOfPosts = await Blog.find({
        user: req.user._id
      }).countDocuments();
      const blogs = await Blog.find({ user: req.user.id })
        .skip((page - 1) * postPerPage)
        .limit(postPerPage);
      res.render("users/index", {
        pageTitle: "Dashboard",
        message: req.flash("success_msg"),
        error: req.flash("error"),
        name: req.user.fullname,
        blogs,
        formatDate,
        currentPage: page,
        nextPage: page + 1,
        previousPage: page - 1,
        hasNextPage: postPerPage * page < numberOfPosts,
        hasPreviousPage: page > 1,
        lastPage: Math.ceil(numberOfPosts / postPerPage)
      });
    } catch (error) {
      console.log(error);
      res.redirect("/error/500");
    }
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
    res.render("users/login", {
      pageTitle: "Login",
      message: req.flash("success_msg"),
      error: req.flash("error")
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
    res.render("users/register", {
      pageTitle: "Register",
      message: req.flash("success_msg"),
      error: req.flash("error")
    });
  }

  public static async handleLogin(req: any, res: any, next: any) {
    try {
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
          failureFlash: true
        })(req, res, next);
      } else {
        req.flash("error", "recaptcha error");
        res.redirect("/admin/login");
      }
    } catch (error) {
      console.log(error);
      res.redirect("/error/500");
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
    req.flash("success_msg", "login was successfully");
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
      schemaUser
        .validate(req.body, { abortEarly: false })
        .then(() => {
          bcrypt.hash(password, 10).then(async (res) => {
            await User.create({
              fullname,
              email,
              password: res
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
      console.log(error);
      res.redirect("/error/500");
    }
  }
}
