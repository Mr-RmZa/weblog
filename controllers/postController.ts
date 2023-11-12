import sharp from "sharp";
import multer from "multer";
import { ParsedQs } from "qs";
import shortId from "shortid";
import appRoot from "app-root-path";
import { Blog } from "../models/Blog";
import { truncate } from "../utils/helpers";
import { formatDate } from "../utils/jalali";
import { fileFilter, storage } from "../utils/multer";
import { schemaPost } from "../models/secure/postValidation";
import { Request, ParamsDictionary, Response } from "express-serve-static-core";

export class postController {
  public static async index(req: any, res: any) {
    const page = +req.query.page || 1;
    const postPerPage = 5;

    try {
      const numberOfPosts = await Blog.find({
        status: "public"
      }).countDocuments();

      const posts = await Blog.find({ status: "public" })
        .sort({
          createdAt: "desc"
        })
        .skip((page - 1) * postPerPage)
        .limit(postPerPage);

      res.render("index", {
        pageTitle: "weblog",
        message: req.flash("success_msg"),
        error: req.flash("error"),
        posts,
        formatDate,
        truncate,
        currentPage: page,
        nextPage: page + 1,
        previousPage: page - 1,
        hasNextPage: postPerPage * page < numberOfPosts,
        hasPreviousPage: page > 1,
        lastPage: Math.ceil(numberOfPosts / postPerPage)
      });
    } catch (err) {
      console.log(err);
      res.render("errors/500");
    }
  }

  public static async show(req: any, res: any) {
    try {
      const post = await Blog.findOne({ _id: req.params.id }).populate("user");

      if (!post) return res.redirect("errors/404");

      res.render("posts/show", {
        pageTitle: post.title,
        post,
        message: req.flash("success_msg"),
        error: req.flash("error"),
        formatDate
      });
    } catch (err) {
      console.log(err);
      res.render("errors/500");
    }
  }

  public static create(
    req: { flash: (arg0: string) => any },
    res: {
      render: (
        arg0: string,
        arg1: { pageTitle: string; message: any; error: any }
      ) => void;
    }
  ) {
    res.render("posts/create", {
      pageTitle: "createPost",
      message: req.flash("success_msg"),
      error: req.flash("error")
    });
  }

  public static store(req: any, res: any) {
    const thumbnail = req.files ? req.files.thumbnail : {};
    const fileName = `${shortId.generate()}_${thumbnail.name}`;
    const uploadPath = `${appRoot}/public/uploads/thumbnails/${fileName}`;
    try {
      req.body = { ...req.body, thumbnail };
      schemaPost
        .validate(req.body, { abortEarly: false })
        .then(async () => {
          await sharp(thumbnail.data)
            .jpeg({ quality: 60 })
            .toFile(uploadPath)
            .catch((err) => console.log(err));
          await Blog.create({
            ...req.body,
            user: req.user.id,
            thumbnail: fileName
          });
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
      fileFilter: fileFilter
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
              quality: 60
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
      _id: req.params.id
    });

    if (!post) {
      return res.redirect("errors/404");
    }

    if (post.user!.toString() != req.user._id) {
      return res.redirect("/admin");
    } else {
      res.render("posts/edit", {
        pageTitle: "editPost",
        message: req.flash("success_msg"),
        error: req.flash("error"),
        post
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

  public static async delete(
    req: { params: { id: any }; flash: (arg0: string, arg1: string) => void },
    res: { redirect: (arg0: string) => void }
  ) {
    const post = await Blog.findOne({
      _id: req.params.id
    });
    if (post) {
      const result = await Blog.findByIdAndRemove(req.params.id);
      console.log(result);
      req.flash("success_msg", "post deleted!");
      res.redirect("/admin");
    } else {
      return res.redirect("errors/404");
    }
  }
}
