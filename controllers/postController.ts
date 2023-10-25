import multer from "multer";
import { v4 as uuidv4 } from "uuid";
import { Blog } from "../models/Blog";
import { schemaPost } from "../models/secure/postValidation";
import { Request, ParamsDictionary, Response } from "express-serve-static-core";
import { ParsedQs } from "qs";
import { fileFilter, storage } from "../utils/multer";

export class postController {
  public static index(
    req: { flash: (arg0: string) => any },
    res: {
      render: (
        arg0: string,
        arg1: { pageTitle: string; message: any; error: any }
      ) => void;
    }
  ) {
    res.render("posts/createPost", {
      pageTitle: "createPost",
      message: req.flash("success_msg"),
      error: req.flash("error")
    });
  }

  public static async create(
    req: {
      body: any;
      user: { id: any };
      flash: (arg0: string, arg1: string) => void;
    },
    res: any
  ) {
    try {
      schemaPost
        .validate(req.body, { abortEarly: false })
        .then(async () => {
          await Blog.create({ ...req.body, user: req.user.id });
          req.flash("success_msg", "post created!");
          res.redirect("/admin");
        })
        .catch((err: { errors: any }) => {
          req.flash("error", err.errors);
          res.redirect("/blog/create");
        });
    } catch (error) {
      console.log(error);
      res.redirect("/error/500");
    }
  }

  public static async uploadImage(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>, number>
  ) {
    const upload = multer({
      limits: { fileSize: 4000000 },
      dest: "uploads/",
      storage: storage,
      fileFilter: fileFilter
    }).single("image");

    upload(req, res, (err) => {
      if (err) {
        res.send(err);
      } else {
        if (req.file) {
          res.status(200).send("آپلود عکس موفقیت آمیز بود");
        } else {
          res.send("جهت آپلود باید عکسی انتخاب کنید");
        }
      }
    });
  }
}
