import passport from "passport";
import { Strategy } from "passport-local";
import bcrypt from "bcryptjs";
import { User } from "../models/User";

passport.use(new Strategy({ usernameField: "email" }, async (email, password, done) => {
    try {
        const user = await User.findOne({ email });
        if (!user) {
            return done(null, false, {message:"not fount user"})
        }
        const isMatch = await bcrypt.compare(password, user.password!);
        if (isMatch) {
            return done(null, user)
        } else {
            return done(null, false, { message: "email or password not true" });
        }
    } catch (error) {
        console.log(error);
    }
}));