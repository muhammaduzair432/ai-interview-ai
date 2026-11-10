import { Router } from "express";
import { loginUser, registerUser, googleAuthCallback} from "../controllers/auth.controller.js";
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
// SECURED ROUTES
 router.route("/logout").post(verifyJwt,logoutUser)
 // Google Auth Routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get(
    "/google/callback",
    passport.authenticate("google", { session: false, failureRedirect: "/login" }),
    googleAuthCallback
);



export default router