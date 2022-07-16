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
    about: {
        type: String,
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
    },
    socialLinks: {
        type: Object,
        facebook: {
            type: String,
        },
        twitter: {
            type: String,
        },
        instagram: {
            type: String,
        },
        linkedin: {
            type: String,
        },
        github: {
            type: String,
        },
        reddit: {
            type: String,
        },
        twitch: {
            type: String,
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
    try {
        const user = this;
        const rawObject = user.toObject();
        delete rawObject.password
        delete rawObject.accessTokens
        delete rawObject.avatar
        return rawObject
    } catch (err) {
        console.log(err)
    }
}

/***** returning secured data by filtering out the passwords and tokens *****/
UserSchema.methods.getSecuredDataWithProfile = function () {
    try {
        const user = this;
        const rawObject = user.toObject();
        delete rawObject.password
        delete rawObject.accessTokens
        return rawObject
    } catch (err) {
        console.log(err);
    }
}

/*****inserting jwt*****/
UserSchema.methods.generateUserWithAuthToken = function () {
    try {
        const user = this;
        const token = jwt.sign({ _id: user._id }, process.env.SECRETE_KEY, { expiresIn: "7 days" });
        user.accessTokens.push({ token });
        return { user: user.getSecuredDataWithProfile(), token };
    } catch (err) {
        console.log(err)
    }
}

/*****middle ware to protect password*****/
UserSchema.pre("save", async function (next) {
    try {
        const user = this;
        if (user.isModified("password")) {
            const password = user.password;
            const hashed = await bcryptjs.hash(password, 8);
            user.password = hashed;
        }

    } catch (err) {
        console.log(err)
    }
    next();
})

const User = mongoose.model("User", UserSchema);

module.exports = User;