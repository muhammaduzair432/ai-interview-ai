import { Router } from "express";
import { loginUser, registerUser,googleAuthCallback,getCurrentUser,getUserProfile} from "../controllers/auth.controller.js";
import  {upload} from "../middlewares/multer.middleware.js"
import { logoutUser } from "../controllers/auth.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import passport from "passport";
import { googleAuthConfigured } from "../services/passport.js";


const router= Router()
const requireGoogleAuth = (req, res, next) => {
    if (!googleAuthConfigured) {
        return res.status(503).json({ message: "Google authentication is not configured" });
    }

    next();
};

router.route("/registerUser").post( upload.fields([
    {name:"avatar",
        maxCount:1
    }
])
,registerUser)
router.route("/login").post(loginUser)
router.route("/current-user").get(verifyJwt,getCurrentUser)
router.route("/profile").get(verifyJwt,getUserProfile)
// SECURED ROUTES
 router.route("/logout").post(verifyJwt,logoutUser)
 // Google Auth Routes
router.get("/google", requireGoogleAuth, passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
    "/google/callback",
    requireGoogleAuth,
    passport.authenticate("google", {
        session: false,
        failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=GoogleAuthFailed`
    }),
    googleAuthCallback
);



export default router