const mongoose = require("mongoose")
const Schema = mongoose.Schema
const validator = require("validator")
const bcryptjs = require("bcryptjs")
const jwt = require("jsonwebtoken")

const UserSchema = new Schema({
    username: {
        type: String,
        required: true,
        trim: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        unique: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error("not an email")
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        validate(value) {
            if (!validator.isStrongPassword(value)) {
                throw new Error("not a strong password")
            }
        }
    },
    avatar: {
        type: Buffer,
    },
    accessTokens: {
        type: Array,
        token: {
            type: String,
            required: true,
        }
    }
}, { timestamps: true });

/* ********* Authentication to check if user exists with given creds ********** */
UserSchema.statics.findUserByCredentials = async function (field, password, type) {

    try {
        let user;
        if (type === "email") {
            user = await User.findOne({ email: field });
        } else {
            user = await User.findOne({ username: field });
        }

        if (!user) {
            return { error: "no user" };
        }

        const isValidPassword = await bcryptjs.compare(password, user.password);

        if (!isValidPassword) {
            return { error: "no user" };
        }

        return user;
    } catch (err) {
        return { error: err };
    }
}

/***** returning secured data by filtering out the passwords and tokens *****/
UserSchema.methods.getSecuredData = function () {
    const user = this;
    const rawObject = user.toObject();
    delete rawObject.password
    delete rawObject.accessTokens
    delete rawObject.avatar
    return rawObject
}

/***** returning secured data by filtering out the passwords and tokens *****/
UserSchema.methods.getSecuredDataWithProfile = function () {
    const user = this;
    const rawObject = user.toObject();
    delete rawObject.password
    delete rawObject.accessTokens
    return rawObject
}

/*****inserting jwt*****/
UserSchema.methods.generateUserWithAuthToken = function () {
    const user = this;
    const token = jwt.sign({ _id: user._id }, process.env.SECRETE_KEY, { expiresIn: "7 days" });
    user.accessTokens.push({ token });
    return { user: user.getSecuredDataWithProfile(), token };
}

/*****middle ware to protect password*****/
UserSchema.pre("save", async function (next) {
    const user = this;
    if (user.isModified("password")) {
        const password = user.password;
        const hashed = await bcryptjs.hash(password, 8);
        user.password = hashed;
    }
    next();
})

const User = mongoose.model("User", UserSchema);

module.exports = User;