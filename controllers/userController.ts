import { object, ref, string } from "yup";

export class userController {
  public static login(
    req: any,
    res: { render: (arg0: string, arg1: { pageTitle: string }) => void }
  ) {
    res.render("login", { pageTitle: "Login" });
  }

  public static register(
    req: any,
    res: { render: (arg0: string, arg1: { pageTitle: string }) => void }
  ) {
    res.render("register", { pageTitle: "Register" });
  }

  public static registerPost(
    req: { body: any },
    res: {
      redirect: (arg0: string) => void;
      render: (arg0: string, arg1: { pageTitle: string; errors: any }) => void;
    }
  ) {
    schema
      .validate(req.body, { abortEarly: false })
      .then((result: any) => {
        console.log(result);
        res.redirect("/admin/login");
      })
      .catch((err: { errors: any }) => {
        console.log(err.errors);
        res.render("register", { pageTitle: "register", errors: err.errors });
      });
  }
}

export const schema = object().shape({
  name: string()
    .required("full lname is required")
    .min(4, "full name minimum 4 character")
    .max(255, "full name maximum 255 character"),
  email: string().email("please enter email").required("email is required"),
  password: string()
    .required("password is required")
    .min(4, "password minimum 4 character")
    .max(255, "password maximum 255 character"),
  confirmPassword: string()
    .required("confirm password is required")
    .oneOf([ref("password")], "password does not match"),
});
