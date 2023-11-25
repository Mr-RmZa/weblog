import fs from "fs";
import sharp from "sharp";
import shortId from "shortid";
import appRoot from "app-root-path";
import { Blog } from "../models/Blog";
import { Request, Response } from "express";
import { truncate } from "../utils/helpers";
import { formatDate } from "../utils/jalali";
import { schemaImage, schemaPost } from "../models/secure/postValidation";

export class postController {
  public static async index(req: Request, res: Response) {
    try {
      // let auth;
      // req.isAuthenticated() ? (auth = true) : (auth = false);

      const page = +req.query.page! || 1;
      const postPerPage = 5;

      const numberOfPosts = await Blog.find({
        status: "public",
      }).countDocuments();

      const posts = await Blog.find({ status: "public" })
        .sort({
          createdAt: "desc",
        })
        .skip((page - 1) * postPerPage)
        .limit(postPerPage);

      return res.render("index", {
        pageTitle: "weblog",
        message: req.flash("success_msg"),
        error: req.flash("error"),
        posts,
        url: process.env.URl,
        formatDate,
        truncate,
        currentPage: page,
        nextPage: page + 1,
        previousPage: page - 1,
        hasNextPage: postPerPage * page < numberOfPosts,
        hasPreviousPage: page > 1,
        lastPage: Math.ceil(numberOfPosts / postPerPage),
        // auth,
      });
    } catch (error) {
      console.log(error);
      return res.redirect("/error/500");
    }
  }

  public static async show(req: Request, res: Response) {
    try {
      const post = await Blog.findOne({ _id: req.params.id }).populate("user");
      if (post) {
        return res.render("posts/show", {
          pageTitle: post.title,
          post,
          url: process.env.URl,
          formatDate,
        });
      } else {
        req.flash("error", "there is nothing!");
        return res.redirect("/");
      }
    } catch (error) {
      console.log(error);
      return res.redirect("/error/500");
    }
  }

  public static create(req: Request, res: Response) {
    try {
      return res.render("posts/create", {
        pageTitle: "Create Post",
        message: req.flash("success_msg"),
        error: req.flash("error"),
      });
    } catch (error) {
      console.log(error);
      return res.redirect("/error/500");
    }
  }

  public static store(
    req: {
      files: { thumbnail: any };
      body: any;
      user: { id: any };
      flash: (arg0: string, arg1: string) => void;
    },
    res: any
  ) {
    try {
      const thumbnail = req.files ? req.files.thumbnail : {};
      const fileName = `${shortId.generate()}_${thumbnail.name}`;
      const uploadPath = `${appRoot}/public/uploads/thumbnails/${fileName}`;
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
            thumbnail: fileName,
          });
          req.flash("success_msg", "post created!");
          return res.redirect("/admin");
        })
        .catch((err: { errors: string }) => {
          req.flash("error", err.errors);
          return res.redirect("/blog/create");
        });
    } catch (error) {
      console.log(error);
      return res.redirect("/error/500");
    }
  }

  public static upload(req: { files: { image: any }; body: any }, res: any) {
    try {
      if (req.files) {
        const image = req.files ? req.files.image : {};
        const fileName = `${shortId.generate()}_${image.name}`;
        const uploadPath = `${appRoot}/public/uploads/${fileName}`;
        req.body = { ...req.body, image };
        schemaImage
          .validate(req.body, { abortEarly: false })
          .then(async () => {
            await sharp(image.data)
              .jpeg({ quality: 60 })
              .toFile(uploadPath)
              .catch((err) => console.log(err));
            return res
              .status(200)
              .send(`http://${process.env.URL}:3000/uploads/${fileName}`);
          })
          .catch((err: { errors: string }) => {
            return res.status(400).send(err.errors);
          });
      } else {
        return res.send("you must select a photo to upload");
      }
    } catch (error) {
      console.log(error);
      return res.redirect("/error/500");
    }
  }

  public static async edit(
    req: {
      params: { id: any };
      user: { _id: string };
      flash: (arg0: string, arg1?: string | undefined) => void;
    },
    res: any
  ) {
    try {
      const post = await Blog.findOne({
        _id: req.params.id,
      });
      if (post) {
        if (post.user!.toString() == req.user._id) {
          return res.render("posts/edit", {
            pageTitle: "Edit Post",
            message: req.flash("success_msg"),
            error: req.flash("error"),
            post,
          });
        } else {
          req.flash("error", "there is nothing!");
          return res.redirect("/admin");
        }
      } else {
        req.flash("error", "there is nothing!");
        return res.redirect("/admin");
      }
    } catch (error) {
      console.log(error);
      return res.redirect("/error/500");
    }
  }

  public static async update(
    req: {
      files: { thumbnail: any };
      params: { id: any };
      body: any;
      user: { _id: string };
      flash: (arg0: string, arg1: string) => void;
    },
    res: any
  ) {
    try {
      const thumbnail = req.files ? req.files.thumbnail : {};
      const fileName = `${shortId.generate()}_${thumbnail.name}`;
      const uploadPath = `${appRoot}/public/uploads/thumbnails/${fileName}`;
      const post = await Blog.findOne({ _id: req.params.id });
      if (thumbnail.name) {
        req.body = { ...req.body, thumbnail };
      } else {
        req.body = {
          ...req.body,
          thumbnail: {
            name: "placeholder",
            size: 0,
            mimetype: "image/jpeg",
          },
        };
      }
      schemaPost
        .validate(req.body, { abortEarly: false })
        .then(async () => {
          if (post) {
            if (post.user!.toString() == req.user._id) {
              if (thumbnail.name) {
                fs.unlink(
                  `${appRoot}/public/uploads/thumbnails/${post.thumbnail}`,
                  async (err: any) => {
                    if (err) console.log(err);
                    else {
                      await sharp(thumbnail.data)
                        .jpeg({ quality: 60 })
                        .toFile(uploadPath)
                        .catch((err) => console.log(err));
                    }
                  }
                );
              }

              const { title, status, body } = req.body;
              post.title = title;
              post.status = status;
              post.body = body;
              post.thumbnail = thumbnail.name ? fileName : post.thumbnail;

              await post.save();
              req.flash("success_msg", "post edited!");
              return res.redirect("/admin");
            } else {
              req.flash("error", "there is nothing!");
              return res.redirect("/admin");
            }
          } else {
            req.flash("error", "there is nothing!");
            return res.redirect("/admin");
          }
        })
        .catch((err) => {
          req.flash("error", err.errors);
          return res.redirect(`/blog/edit/${req.params.id}`);
        });
    } catch (error) {
      console.log(error);
      return res.redirect("/error/500");
    }
  }

  public static async delete(req: Request, res: Response) {
    try {
      const post = await Blog.findOne({
        _id: req.params.id,
      });
      if (post) {
        const result = await Blog.findByIdAndRemove(req.params.id);
        console.log(result);
        fs.unlink(
          `${appRoot}/public/uploads/thumbnails/${post.thumbnail}`,
          (err: any) => {
            if (err) console.log(err);
          }
        );
        req.flash("success_msg", "post deleted!");
        return res.redirect("/admin");
      } else {
        req.flash("error", "there is nothing!");
        return res.redirect("/admin");
      }
    } catch (error) {
      console.log(error);
      return res.redirect("/error/500");
    }
  }

  public static async search(
    req: {
      query: { page: any; search: string | RegExp };
      body: string;
      flash: (arg0: string, arg1?: string) => any;
    },
    res: Response
  ) {
    try {
      if (req.query.search) {
        const page = +req.query.page! || 1;
        const postPerPage = 5;

        const numberOfPosts = await Blog.find({
          status: "public",
          title: { $regex: new RegExp(req.query.search, "i") },
        }).countDocuments();

        const posts = await Blog.find({
          status: "public",
          title: { $regex: new RegExp(req.query.search, "i") },
        })
          .sort({
            createdAt: "desc",
          })
          .skip((page - 1) * postPerPage)
          .limit(postPerPage);

        return res.render("index", {
          pageTitle: `your search results "${req.query.search}"`,
          message: req.flash("success_msg"),
          error: req.flash("error"),
          posts,
          url: process.env.URl,
          formatDate,
          truncate,
          currentPage: page,
          nextPage: page + 1,
          previousPage: page - 1,
          hasNextPage: postPerPage * page < numberOfPosts,
          hasPreviousPage: page > 1,
          lastPage: Math.ceil(numberOfPosts / postPerPage),
        });
      } else {
        req.flash("error", "search is required");
        return res.redirect("/");
      }
    } catch (error) {
      console.log(error);
      return res.redirect("/error/500");
    }
  }

  public static async searchPost(req: any, res: Response) {
    try {
      if (req.query.search) {
        const page = +req.query.page! || 1;
        const postPerPage = 5;

        const numberOfPosts = await Blog.find({
          status: "public",
          user: req.user.id,
          title: { $regex: new RegExp(req.query.search, "i") },
        }).countDocuments();

        const blogs = await Blog.find({
          status: "public",
          user: req.user.id,
          title: { $regex: new RegExp(req.query.search, "i") },
        })
          .sort({
            createdAt: "desc",
          })
          .skip((page - 1) * postPerPage)
          .limit(postPerPage);

        return res.render("users/index", {
          pageTitle: `your search results "${req.query.search}"`,
          message: req.flash("success_msg"),
          error: req.flash("error"),
          blogs,
          name: req.user.fullName,
          formatDate,
          truncate,
          currentPage: page,
          nextPage: page + 1,
          previousPage: page - 1,
          hasNextPage: postPerPage * page < numberOfPosts,
          hasPreviousPage: page > 1,
          lastPage: Math.ceil(numberOfPosts / postPerPage),
        });
      } else {
        req.flash("error", "search is required");
        return res.redirect("/admin");
      }
    } catch (error) {
      console.log(error);
      return res.redirect("/error/500");
    }
  }
}
