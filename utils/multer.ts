import multer from "multer";
import { Request } from "express"; // Import the Request type from Express if you're using Express
import { v4 as uuidv4 } from "uuid";

export const storage = multer.diskStorage({
  destination: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, destination: string) => void
  ) => {
    cb(null, "./public/uploads/");
  },
  filename: (
    req: Request,
    file: Express.Multer.File,
    cb: (error: Error | null, filename: string) => void
  ) => {
    cb(null, `${uuidv4()}_${file.originalname}`);
  }
});

export const fileFilter = (
  req: Request,
  file: Express.Multer.File,
  cb: any
) => {
  if (file.mimetype === "image/jpeg") {
    cb(null, true);
  } else {
    cb("Only JPEG extension is supported", false);
  }
};
