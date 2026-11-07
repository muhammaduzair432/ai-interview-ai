import  express from "express";
import passport from "passport";
import  "./services/passport.js";
import userModel from "./models/user.model.js";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(passport.initialize());

export {app};