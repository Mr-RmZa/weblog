import { Router } from "express";

export const routerError = Router();

routerError.get("/500", (req, res) => {
  res.render("errors/500", {
    pageTitle: "500 | server",
  });
});
