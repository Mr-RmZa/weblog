import { object, ref, string } from "yup";

export const schemaContact = object().shape({
  fullname: string().required("fullname is required"),
  email: string()
    .email("The email address is not correct")
    .required("email is required"),
});
