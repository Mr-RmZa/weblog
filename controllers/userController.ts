import axios from "axios";
import bcrypt from "bcryptjs";
import passport from "passport";
import { User } from "../models/User";
import { Blog } from "../models/Blog";
import { sendEmail } from "../utils/mailer";
import { truncate } from "../utils/helpers";
import { formatDate } from "../utils/jalali";
import { errorController } from "./errorController";
import { schemaUser } from "../models/secure/userValidation";

export class userController {
  public static async dashboard(
    req: {
      query: { page: string | number };
      user: { _id: any; id: any; fullname: any };
      flash: (arg0: string) => any;
    },
    res: any
  ) {
    try {
      const page = +req.query.page || 1;
      const postPerPage = 5;
      const numberOfPosts = await Blog.find({
        user: req.user._id,
      }).countDocuments();
      const blogs = await Blog.find({ user: req.user.id })
        .sort({
          createdAt: "desc",
        })
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
        lastPage: Math.ceil(numberOfPosts / postPerPage),
        truncate,
      });
    } catch (error) {
      console.log(error);
      errorController[500]("", res);
    }
  }

  public static login(
    req: { flash: (arg0: string) => any },
    res: { render: any }
  ) {
    try {
      res.render("users/login", {
        pageTitle: "Login",
        message: req.flash("success_msg"),
        error: req.flash("error"),
      });
    } catch (error) {
      console.log(error);
      errorController[500]("", res);
    }
  }

  public static register(
    req: { flash: (arg0: string) => any },
    res: { render: any }
  ) {
    try {
      res.render("users/register", {
        pageTitle: "Register",
        message: req.flash("success_msg"),
        error: req.flash("error"),
      });
    } catch (error) {
      console.log(error);
      errorController[500]("", res);
    }
  }

  public static async handleLogin(
    req: {
      body: { [x: string]: any };
      connection: { remoteAddress: any };
      flash: (arg0: string, arg1: string) => void;
      originalUrl: string;
    },
    res: any,
    next: any
  ) {
    try {
      const GRR = req.body["g-recaptcha-response"];
      if (GRR) {
        const verifyUrl = `https://www.google.com/recaptcha/api/siteverify?secret=${process.env.RECAPTCHA}&response=${GRR}&remoteip=${req.connection.remoteAddress}`;
        const response = await axios.post(verifyUrl);
        if (response.data.success) {
          passport.authenticate("local", {
            failureRedirect: req.originalUrl,
            failureFlash: true,
          })(req, res, next);
        } else {
          req.flash("error", "recaptcha error");
          res.redirect(req.originalUrl);
        }
      } else {
        req.flash("error", "recaptcha is required");
        res.redirect(req.originalUrl);
      }
    } catch (error) {
      console.log(error);
      errorController[500]("", res);
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
    try {
      if (req.body.remember) {
        req.session.cookie.originalMaxAge = 20 * 60 * 60 * 1000; // 1 day or 24 hour
      } else {
        req.session.cookie.expires = null;
      }
      req.flash("success_msg", "login was successfully");
      res.redirect("/admin");
    } catch (error) {
      console.log(error);
      errorController[500]("", res);
    }
  }

  public static logout(
    req: {
      logout: (arg0: (err: any) => any) => void;
      flash: (arg0: string, arg1: string) => void;
    },
    res: any,
    next: (arg0: any) => any
  ) {
    try {
      req.logout((err: any) => {
        if (err) {
          return next(err);
        }
        req.flash("success_msg", "logout was successfully");
        res.redirect("/");
      });
    } catch (error) {
      console.log(error);
      errorController[500]("", res);
    }
  }

  public static async createUser(
    req: {
      body: { fullname: any; email: any; password: any };
      flash: (arg0: string, arg1: string) => void;
    },
    res: any
  ) {
    try {
      const { fullname, email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) {
        schemaUser
          .validate(req.body, { abortEarly: false })
          .then(() => {
            bcrypt.hash(password, 10).then(async (res) => {
              await User.create({
                fullname,
                email,
                password: res,
              });
            });

            //? Send Welcome Email
            sendEmail(
              email,
              fullname,
              "خوش آمدی به وبلاگ ما",
              "خیلی خوشحالیم که به جمع ما وبلاگرهای خفن ملحق شدی"
            );

            req.flash("success_msg", "register successfully!");
            res.redirect("/admin/login");
          })
          .catch((err: { errors: any }) => {
            req.flash("error", err.errors);
            res.redirect("/admin/register");
          });
      } else {
        req.flash("error", "Duplicate Email!");
        res.redirect("/admin/register");
      }
    } catch (error) {
      console.log(error);
      errorController[500]("", res);
    }
  }
}
