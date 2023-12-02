export class auth {
  public static authenticated(
    req: {
      isAuthenticated: () => any;
      flash: (arg0: string, arg1: string) => void;
    },
    res: { redirect: (arg0: string) => void },
    next: () => any
  ) {
    if (req.isAuthenticated()) {
      return next();
    }
    req.flash("error", "you are not login!");
    return res.redirect("/admin/login");
  }
}
