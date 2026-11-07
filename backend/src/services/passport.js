import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { userModel } from "../models/User.js";

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: process.env.GOOGLE_CALLBACK_URL, // e.g. http://localhost:5000/api/auth/google/callback
        },
        async (accessToken, refreshToken, profile, done) => {
            try {
                // 1. Check if user already exists with this email
                let user = await userModel.findOne({ email: profile.emails[0].value });

                if (user) {
                    // If user exists but didn't have googleId saved, link it
                    if (!user.googleId) {
                        user.googleId = profile.id;
                        if (!user.avatar && profile.photos?.[0]?.value) {
                            user.avatar = profile.photos[0].value;
                        }
                        await user.save();
                    }
                    return done(null, user);
                }

                // 2. If user doesn't exist, create a new profile automatically
                // Generating a clean unique username from email/display name
                const baseUsername = profile.emails[0].value.split("@")[0];
                const uniqueUsername = `${baseUsername}_${Math.floor(Math.random() * 1000)}`;

                user = await userModel.create({
                    username: uniqueUsername,
                    email: profile.emails[0].value,
                    fullname: profile.displayName,
                    googleId: profile.id,
                    avatar: profile.photos?.[0]?.value || "",
                    // password is omitted, which passes your schema requirement because googleId exists!
                });

                return done(null, user);
            } catch (error) {
                return done(error, null);
            }
        }
    )
);