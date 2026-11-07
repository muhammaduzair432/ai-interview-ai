import mongoose, { Schema } from "mongoose";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const userSchema = new Schema({
    username: {
        type: String,
        unique: [true, "username already taken"],
        required: true,
        // lowercase: true,
        // trim: true,
        // index: true,
    },

    email: {
        type: String,
        unique: [true, "Account already exists with this email address"],
        required: true,
        // lowercase: true,
        // trim: true,
        // index: true,
    },

    password: {
        type: String,
        // Password is required ONLY IF the user does NOT have a googleId
        required: function () {
            return !this.googleId;
        }
    },

    // Added for Google Authentication
    googleId: {
        type: String,
        default: null,
    },

    avatar: {
        type: String,
        default: ""
    },

    refreshToken: {
        type: String,
    },

    fullname: {
        type: String,
        required: true,
        // trim: true,
    }
}, { timestamps: true });

userSchema.pre("save", async function () {
    // If the password wasn't modified or doesn't exist (e.g. Google user), skip hashing
    if (!this.isModified("password") || !this.password) return;

    this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function (password) {
    if (!this.password) return false; // Google users don't have local passwords
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
    );
};

userSchema.methods.generateRefreshToken = function () {
    return jwt.sign({
        _id: this._id,
    },
        process.env.REFRESH_TOKEN_SECRET,
        {
            expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
        }
    );
};

// Fixed the export syntax bug from userSchema.model to mongoose.model
export const userModel = mongoose.model("User", userSchema);