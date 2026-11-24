import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import  {userModel}  from "../models/user.model.js";

export const googleAuthConfigured = Boolean(
    process.env.GOOGLE_CLIENT_ID &&
    process.env.GOOGLE_CLIENT_SECRET &&
    process.env.GOOGLE_CALLBACK_URL
);

if (googleAuthConfigured) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_CALLBACK_URL,
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    let user = await userModel.findOne({ email: profile.emails[0].value });

                    if (user) {
                        let userChanged = false;

                        if (!user.googleId) {
                            user.googleId = profile.id;
                            userChanged = true;
                        }

                        const googleAvatar = profile.photos?.[0]?.value;
                        if (googleAvatar && user.avatar !== googleAvatar) {
                            user.avatar = googleAvatar;
                            userChanged = true;
                        }

                        if (userChanged) {
                            await user.save();
                        }

                        return done(null, user);
                    }

                    const baseUsername = profile.emails[0].value.split("@")[0];
                    const uniqueUsername = `${baseUsername}_${Math.floor(Math.random() * 1000)}`;

                    user = await userModel.create({
                        username: uniqueUsername,
                        email: profile.emails[0].value,
                        fullname: profile.displayName,
                        googleId: profile.id,
                        avatar: profile.photos?.[0]?.value || "",
                    });

                    return done(null, user);
                } catch (error) {
                    return done(error, null);
                }
            }
        )
    );
} else {
    console.warn(
        "Google OAuth is disabled; configure GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, and GOOGLE_CALLBACK_URL."
    );
}