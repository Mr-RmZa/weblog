import { object, ref, string } from "yup";

export const schemaForget = object().shape({
  password: string()
    .required("password is required")
    .min(5, "password minimum 5 character")
    .max(100, "password maximum 100 character"),
  confirmPassword: string()
    .required("confirm password is required")
    .oneOf([ref("password")], "password does not match"),
});
