import { log } from "console-log-colors";
import express, { Router } from "express";
import path from "path";
import { router } from "./routes";
import morgan from "morgan";
import connect from "./config/db";
import * as dotenv from "dotenv";
import { routerAdmin } from "./routes/admin";

// env
dotenv.config({ path: "./config/config.env" });

// database
connect.mongodb();

const app = express();

// show requests
app.use(morgan("dev"));

// views
app.set("view engine", "ejs");

// bodyPaser
app.use(express.urlencoded({ extended: false }));

// static folder
app.use(express.static(path.join(__dirname, "public")));
 
// routes
app.use("/admin", routerAdmin);
app.use("/", router);

app.listen(process.env.PORT, () =>
  log.green(`start server port : ${process.env.PORT}`)
);
