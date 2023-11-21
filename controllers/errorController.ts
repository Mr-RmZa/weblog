export class errorController {
  public static 404(
    req: any,
    res: {
      render: (arg0: string, arg1: { pageTitle: string }) => void;
    }
  ) {
    return res.render("errors/404", { pageTitle: "404 | not found" });
  }

  public static 500(
    req: any,
    res: {
      render: (arg0: string, arg1: { pageTitle: string }) => void;
    }
  ) {
    return res.render("errors/500", { pageTitle: "500 | server" });
  }
}
