import { Blog } from "../models/Blog";

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

  public static async create(
    req: { body: any; user: { id: any } },
    res: any
  ) {
    try {
      await Blog.create({ ...req.body, user: req.user.id });
      res.redirect("/admin");
    } catch (error) {
      console.log(error);
    }
  }
}
