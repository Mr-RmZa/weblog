import multer from "multer";
import { v4 as uuidv4 } from "uuid";

export const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, `${uuidv4()}_${file.originalname}`);
  }
});

export const fileFilter = (
  req: Express.Request,
  file: Express.Multer.File,
  cb: any
): void => {
  if (file.mimetype === "image/jpeg") {
    cb(null, true);
  } else {
    cb("Only JPEG extension is supported", false);
  }
};
