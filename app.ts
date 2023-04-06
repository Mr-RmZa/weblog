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
import passport from "passport";
import MongoStore from "connect-mongo";
import { morganStream } from "./config/winston";

// env
dotenv.config({ path: "./config/config.env" });

// database
connect.mongodb();

// passport configuration
import "./config/passport";

const app = express();

// show requests
app.use(morgan("combined", { stream: morganStream }));

// views
app.set("view engine", "ejs");

//Parse data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// session
app.use(
  session({
    secret: "foo",
    store: MongoStore.create({ mongoUrl: "mongodb://localhost/test" }),
    resave: false,
    saveUninitialized: false,
  })
);

// passport
app.use(passport.initialize());
app.use(passport.session());

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
