const jwt = require("jsonwebtoken");
const User = require("../models/user")

const auth = async (req, res, next) => {
    try {
        const accessToken = req.headers.authorization.replace("Bearer ", "");
        const decoded = jwt.verify(accessToken, process.env.SECRETE_KEY);
        console.log(decoded)
        const user = await User.findById(decoded._id);

        //either user doesn't exists or the token in the user doesn't exists
        if (!user || (user && !user.accessTokens.some(({ token }) => token === accessToken))) {
            return res.status(401).send({ error: "please do authenticate" })
        }

        req.user = user;
        req.token = accessToken;
        next()
    } catch (err) {
        res.status(500).send(err);
    }
}

module.exports = auth;