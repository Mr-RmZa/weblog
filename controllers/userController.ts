import axios from "axios";
import bcrypt from "bcryptjs";
import passport from "passport";
import { User } from "../models/User";
import { Blog } from "../models/Blog";
import { sendEmail } from "../utils/mailer";
import { truncate } from "../utils/helpers";
import { formatDate } from "../utils/jalali";
import jwt, { JwtPayload } from "jsonwebtoken";
import { schemaUser } from "../models/secure/userValidation";
import { schemaForget } from "../models/secure/forgetValidation";

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
      return res.render("users/index", {
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
      return res.redirect("/error/500");
    }
  }

  public static login(
    req: { flash: (arg0: string) => any },
    res: {
      render: (
        arg0: string,
        arg1: { pageTitle: string; message: any; error: any }
      ) => void;
      redirect: (arg0: string) => void;
    }
  ) {
    try {
      return res.render("users/login", {
        pageTitle: "Login",
        message: req.flash("success_msg"),
        error: req.flash("error"),
      });
    } catch (error) {
      console.log(error);
      return res.redirect("/error/500");
    }
  }

  public static register(
    req: { flash: (arg0: string) => any },
    res: {
      render: (
        arg0: string,
        arg1: { pageTitle: string; message: any; error: any }
      ) => void;
      redirect: (arg0: string) => void;
    }
  ) {
    try {
      return res.render("users/register", {
        pageTitle: "Register",
        message: req.flash("success_msg"),
        error: req.flash("error"),
      });
    } catch (error) {
      console.log(error);
      return res.redirect("/error/500");
    }
  }

  public static async recaptcha(
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
          return res.redirect(req.originalUrl);
        }
      } else {
        req.flash("error", "recaptcha is required");
        return res.redirect(req.originalUrl);
      }
    } catch (error) {
      console.log(error);
      return res.redirect("/error/500");
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
      return res.redirect("/admin");
    } catch (error) {
      console.log(error);
      return res.redirect("/error/500");
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
        return res.redirect("/");
      });
    } catch (error) {
      console.log(error);
      return res.redirect("/error/500");
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
            bcrypt.hash(password, 10).then(async (hash) => {
              await User.create({
                fullname,
                email,
                password: hash,
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
            return res.redirect("/admin/login");
          })
          .catch((err: { errors: any }) => {
            req.flash("error", err.errors);
            return res.redirect("/admin/register");
          });
      } else {
        req.flash("error", "Duplicate Email!");
        return res.redirect("/admin/register");
      }
    } catch (error) {
      console.log(error);
      return res.redirect("/error/500");
    }
  }

  public static forgetPassword(
    req: { flash: (arg0: string) => any },
    res: {
      render: (
        arg0: string,
        arg1: { pageTitle: string; message: any; error: any }
      ) => void;
      redirect: (arg0: string) => void;
    }
  ) {
    try {
      return res.render("users/forgetPass", {
        pageTitle: "Forget Password",
        message: req.flash("success_msg"),
        error: req.flash("error"),
      });
    } catch (error) {
      console.log(error);
      return res.redirect("/error/500");
    }
  }

  public static async handleForgetPassword(
    req: { body: { email: any }; flash: (arg0: string, arg1: string) => void },
    res: any
  ) {
    try {
      const { email } = req.body;
      const user = await User.findOne({ email: email });
      if (user) {
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET!, {
          expiresIn: "1h",
        });
        const resetLink = `http://localhost:3000/admin/resetPassword/${token}`;
        console.log(resetLink);

        sendEmail(
          user.email!,
          user.fullname!,
          "فراموشی رمز عبور",
          `جهت تغییر رمز عبور فعلی رو لینک زیر کلیک کنید
          <a href="${resetLink}">لینک تغییر رمز عبور</a>`
        );
        req.flash(
          "success_msg",
          "The email containing the link has been sent successfully"
        );
        return res.redirect("/admin/forgetPassword");
      } else {
        req.flash("error", "User with email is not registered in the database");
        return res.redirect("/admin/forgetPassword");
      }
    } catch (error) {
      console.log(error);
      return res.redirect("/error/500");
    }
  }

  public static resetPassword(
    req: { params: { token: any }; flash: (arg0: string) => any },
    res: {
      render: (
        arg0: string,
        arg1: { pageTitle: string; message: any; error: any; userId: any }
      ) => void;
      redirect: (arg0: string) => void;
    }
  ) {
    try {
      const token = req.params.token;

      let decodedToken;

      try {
        decodedToken = jwt.verify(token, process.env.JWT_SECRET!) as JwtPayload;
        console.log(decodedToken);
      } catch (err) {
        console.log(err);
        if (!decodedToken) {
          return res.redirect("/error/404");
        }
      }
      return res.render("users/resetPass", {
        pageTitle: "Change Password",
        message: req.flash("success_msg"),
        error: req.flash("error"),
        userId: decodedToken.userId,
      });
    } catch (error) {
      console.log(error);
      return res.redirect("/error/500");
    }
  }

  public static async handleResetPassword(
    req: {
      body: { password: any };
      params: { id: any };
      flash: (arg0: string, arg1?: string | undefined) => void;
    },
    res: {
      redirect: (arg0: string) => any;
      render: (
        arg0: string,
        arg1: { pageTitle: string; message: any; error: any; userId: any }
      ) => any;
    }
  ) {
    try {
      const { password } = req.body;
      schemaForget
        .validate(req.body, { abortEarly: false })
        .then(() => {
          bcrypt.hash(password, 10).then(async (hash) => {
            const user = await User.findOne({ _id: req.params.id });
            if (user) {
              user.password = hash;
              await user.save();
              req.flash(
                "success_msg",
                "Your password has been successfully updated"
              );
              return res.redirect("/admin/login");
            } else {
              return res.redirect("/error/404");
            }
          });
        })
        .catch((err: { errors: any }) => {
          req.flash("error", err.errors);
          return res.render("users/resetPass", {
            pageTitle: "Change Password",
            message: req.flash("success_msg"),
            error: req.flash("error"),
            userId: req.params.id,
          });
        });
    } catch (error) {
      console.log(error);
      return res.redirect("/error/500");
    }
  }

  public static contact(
    req: { flash: (arg0: string) => any },
    res: {
      render: (
        arg0: string,
        arg1: { pageTitle: string; message: any; error: any }
      ) => void;
      redirect: (arg0: string) => any;
    }
  ) {
    try {
      return res.render("users/contact", {
        pageTitle: "Content Us",
        message: req.flash("success_msg"),
        error: req.flash("error"),
      });
    } catch (error) {
      console.log(error);
      return res.redirect("/error/500");
    }
  }

  public static handleContact(req: any, res: any) {}
}
