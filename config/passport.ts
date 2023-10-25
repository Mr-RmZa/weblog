import bcrypt from "bcryptjs";
import passport from "passport";
import { User } from "../models/User";
import { Strategy } from "passport-local";

passport.use(
  new Strategy({ usernameField: "email" }, async (email, password, done) => {
    try {
      const user = await User.findOne({ email });
      if (!user) {
        return done(null, false, { message: "email or password not true" });
      }
      const isMatch = await bcrypt.compare(password, user.password!);
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: "email or password not true" });
      }
    } catch (error) {
      console.log(error);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user);
});
