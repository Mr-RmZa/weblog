import { object, ref, string } from "yup";

export const schema = object().shape({
  fullname: string()
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
