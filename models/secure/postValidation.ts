import { mixed, number, object, string } from "yup";

export const schemaPost = object().shape({
  title: string()
    .required("title is required")
    .min(5, "title minimum 5 character")
    .max(100, "title maximum 100 character"),
  body: string()
    .required("description is required")
    .min(5, "description minimum 5 character"),
  status: mixed().oneOf(
    ["private", "public"],
    "choose between private or public status"
  ),
  thumbnail: object().shape({
    name: string().required("thumbnail photo is required"),
    size: number().max(3000000, "the photo should not exceed 3 MB"),
    mimetype: mixed().oneOf(
      ["image/jpeg", "image/png"],
      "only png and jpeg extensions are supported"
    ),
  }),
});

export const schemaImage = object().shape({
  image: object().shape({
    name: string().required("name photo is required"),
    size: number().max(3000000, "the photo should not exceed 3 MB"),
    mimetype: mixed().oneOf(
      ["image/jpeg", "image/png"],
      "only png and jpeg extensions are supported"
    ),
  }),
});
