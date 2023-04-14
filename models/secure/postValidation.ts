import { mixed, object, ref, string } from "yup";

export const schemaPost = object().shape({
  title: string()
    .required("title is required")
    .min(5, "title minimum 5 character")
    .max(100, "title maximum 100 character"),
  body: string().required("description is required"),
  status: mixed().oneOf(
    ["public", "private"],
    "choose between private or public status"
  ),
});
