export class postController {
  public static create(
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
}
