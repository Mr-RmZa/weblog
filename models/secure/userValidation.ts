import { object, ref, string } from "yup";

export const schemaUser = object().shape({
  fullname: string()
    .required("full lname is required")
    .min(5, "full name minimum 5 character")
    .max(100, "full name maximum 100 character"),
  email: string().email("please enter email").required("email is required"),
  password: string()
    .required("password is required")
    .min(5, "password minimum 5 character")
    .max(100, "password maximum 100 character"),
  confirmPassword: string()
    .required("confirm password is required")
    .oneOf([ref("password")], "password does not match")
});
