import { Router } from "express";
import { loginUser, registerUser,googleAuthCallback,getCurrentUser,getUserProfile} from "../controllers/auth.controller.js";
import  {upload} from "../middlewares/multer.middleware.js"
import { logoutUser } from "../controllers/auth.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";
import passport from "passport";


const router= Router()
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
router.get("/google", (request, response, next) => {
    if (!process.env.GOOGLE_CLIENT_ID || !process.env.GOOGLE_CLIENT_SECRET || !process.env.GOOGLE_CALLBACK_URL) {
        return response.status(503).json({
            success: false,
            message: "Google OAuth is not configured",
        });
    }
    return passport.authenticate("google", { scope: ["profile", "email"] })(request, response, next);
});

router.get(
    "/google/callback",
    passport.authenticate("google", {
        session: false,
        failureRedirect: `${process.env.FRONTEND_URL || "http://localhost:5173"}/login?error=GoogleAuthFailed`
    }),
    googleAuthCallback
);



export default router