import { log } from "console-log-colors";
import express from "express";
import path from "path";
import { router } from "./routes";
import morgan from "morgan";
import connect from "./config/db";
import * as dotenv from "dotenv";
import { routerAdmin } from "./routes/admin";
import session from "express-session";
import flash from "connect-flash";

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

// session
app.use(
  session({
    secret: "secret",
    cookie: { maxAge: 60000 },
    resave: false,
    saveUninitialized: false,
  })
);

// flash
app.use(flash());

// static folder
app.use(express.static(path.join(__dirname, "public")));

// routes
app.use("/", router);
app.use("/admin", routerAdmin);
app.use((req, res) => {
  res.render("404", { pageTitle: "404 | not found" });
});

app.listen(process.env.PORT, () =>
  log.green(`start server port : ${process.env.PORT}`)
);
