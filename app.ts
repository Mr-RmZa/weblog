import path from "path";
import morgan from "morgan";
import express from "express";
import passport from "passport";
import * as dotenv from "dotenv";
import { router } from "./routes";
import connect from "./config/db";
import flash from "connect-flash";
import session from "express-session";
import MongoStore from "connect-mongo";
import { log } from "console-log-colors";
import { routerBlog } from "./routes/blog";
import { routerAdmin } from "./routes/admin";
import { morganStream } from "./config/winston";
import { errorController } from "./controllers/errorController";

// env
dotenv.config({ path: "./config/config.env" });

// database
connect.mongodb();

// passport configuration
import "./config/passport";
import { routerError } from "./routes/error";

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
    resave: false,
    unset: "destroy",
    saveUninitialized: false,
    store: MongoStore.create({ mongoUrl: process.env.MONGO_URL })
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
app.use("/blog", routerBlog);
app.use("/error", routerError);
app.use(errorController[404]);

app.listen(process.env.PORT, () =>
  log.green(`start server port : ${process.env.PORT}`)
);
