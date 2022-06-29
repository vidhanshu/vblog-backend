const express = require("express");
const { default: isEmail } = require("validator/lib/isEmail");
const User = require("../models/user");
const Router = express.Router;
const router = new Router();
const auth = require("../middleware/auth")

router.post("/user/register", async (req, res) => {
    const data = req.body;
    const user = new User(data);
    const user_with_token = user.generateUserWithAuthToken();
    try {
        await user.save();
        res.status(201).send(user_with_token);
    } catch (err) {
        res.status(500).send(err)
    }
})


router.post("/user/login", async (req, res) => {
    const { email, password } = req.body;
    try {
        let user;
        if (isEmail(email)) {
            user = await User.findUserByCredentials(email, password, "email");
        } else {
            user = await User.findUserByCredentials(email, password, "username");
        }

        if (user.error) {
            return res.status(404).send(user);
        }

        const user_with_token = user.generateUserWithAuthToken();
        user = await user.save();
        res.status(202).send(user_with_token);

    } catch (err) {
        res.status(500).send(err);
    }
})

router.post("/user/logout", auth, async (req, res) => {
    const user = req.user;
    const token_of_cur_user = req.token;
    try {
        console.log(token_of_cur_user);
        user.accessTokens = user.accessTokens.filter(({ token }) => token !== token_of_cur_user);
        await user.save();
        res.status(202).send();
    } catch (err) {
        res.status(500).send(err);
    }
})

router.post("/user/logout/all", auth, async (req, res) => {
    const user = req.user;
    try {
        user.accessTokens = [];
        await user.save();
        res.status(202).send();
    } catch (err) {
        res.status(500).send(err);
    }
})
module.exports = router;