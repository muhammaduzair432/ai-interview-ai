import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


const userSchema = new Schema({
    username: {
        type: String,
        unique: [ true, "username already taken" ],
        required: true,
    //        lowercase: true,
    //   trim: true,
    //   index: true,
    },

    email: {
        type: String,
        unique: [ true, "Account already exists with this email address" ],
        required: true,
        // lowercase: true,
        // trim: true,
        // index: true,
    },

    password: {
        type: String,
        required: true
    },
    avatar:{
        type: String,
        default:""
    },
        refreshToken: {
        type: String,
    },
    fullname:{
        type: String,
        required: true,
        // trim: true,
        
    }
},{timestamps: true});
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (password) {
    return await bcrypt.compare(password, this.password);
}

userSchema.methods.generateAccessToken = function () {
    return jwt.sign({
        _id: this._id,
        email: this.email,
        username: this.username,
        fullname: this.fullname
    },
        process.env.ACCESS_TOKEN_SECRET,
        {
            expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
        }
    )


}

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id: this._id,

    },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    )


}



export const userModel = userSchema.model("users", userSchema)

