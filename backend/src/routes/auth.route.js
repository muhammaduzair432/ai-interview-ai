import { Router } from "express";
import { loginUser, registerUser, } from "../controllers/auth.controller.js";
import  {upload} from "../middlewares/multer.middleware.js"
import { logoutUser } from "../controllers/auth.controller.js";
import { verifyJwt } from "../middlewares/auth.middleware.js";

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



export default router