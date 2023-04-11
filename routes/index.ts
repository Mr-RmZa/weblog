import { Router } from "express";

export const router = Router();

router.get("/", (req, res) => {
  res.render("index", {
    pageTitle: "Blog",
    message: req.flash("success_msg"),
    error: req.flash("error"),
  });
});
