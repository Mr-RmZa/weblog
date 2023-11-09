import sharp from "sharp";
import multer from "multer";
import { ParsedQs } from "qs";
import shortId from "shortid";
import { Blog } from "../models/Blog";
import { errorController } from "./errorController";
import { fileFilter, storage } from "../utils/multer";
import { schemaPost } from "../models/secure/postValidation";
import { Request, ParamsDictionary, Response } from "express-serve-static-core";

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
      error: req.flash("error"),
    });
  }

  public static create(
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

  public static upload(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>, number>
  ) {
    const upload = multer({
      limits: { fileSize: 4000000 },
      // dest: "uploads/",
      // storage: storage,
      fileFilter: fileFilter,
    }).single("image");
    //req.file
    // console.log(req.file)

    upload(req, res, async (err) => {
      if (err) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res
            .status(400)
            .send("The size of the photo sent should not be more than 4 MB");
        }
        res.status(400).send(err);
      } else {
        if (req.file) {
          const fileName = `${shortId.generate()}_${req.file.originalname}`;
          await sharp(req.file.buffer)
            .jpeg({
              quality: 60,
            })
            .toFile(`./public/uploads/${fileName}`)
            .catch((err) => console.log(err));
          // res.json({"message" : "", "address" : ""});
          res.status(200).send(`http://localhost:3000/uploads/${fileName}`);
        } else {
          res.send("You must select a photo to upload");
        }
      }
    });
  }

  public static async edit(req: any, res: any) {
    const post = await Blog.findOne({
      _id: req.params.id,
    });

    if (!post) {
      return errorController[404];
    }

    if (post.user!.toString() != req.user._id) {
      return res.redirect("/admin");
    } else {
      res.render("posts/editPost", {
        pageTitle: "editPost",
        message: req.flash("success_msg"),
        error: req.flash("error"),
        post,
      });
    }
  }

  public static update(
    req: {
      body: { title: any; status: any; body: any };
      params: { id: any };
      user: { _id: string };
      flash: (arg0: string, arg1: string) => void;
    },
    res: any
  ) {
    try {
      schemaPost
        .validate(req.body, { abortEarly: false })
        .then(async () => {
          const post = await Blog.findOne({ _id: req.params.id });

          if (!post) {
            return res.redirect("errors/404");
          }

          if (post.user!.toString() != req.user._id) {
            return res.redirect("/dashboard");
          } else {
            const { title, status, body } = req.body;
            post.title = title;
            post.status = status;
            post.body = body;

            await post.save();
            req.flash("success_msg", "post edited!");
            res.redirect("/admin");
          }
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
}
