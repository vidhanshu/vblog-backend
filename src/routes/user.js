const express = require("express")
const router = new express.Router();
const User = require("../models/user")
const Blog = require("../models/blog")
const auth = require("../middleware/auth");
const multer = require("multer")
const sharp = require("sharp");

const upload = multer({
    limits: {
        fileSize: 1000000,
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/.(jpg|jpeg|svg|png|webp|gif)$/)) {
            return cb(new Error("please upload jpg/jpeg/png/svg/webp"))
        }
        cb(undefined, true);
    }
})

//PATCH /user/me/update - update me - |only me|
router.patch("/user/me/update", auth, async (req, res) => {
    try {
        const user = req.user;
        const updates = req.body;
        const allowed_updates = ["username", "email", "password", "about", "socialLinks"];
        const requested_updates = Object.keys(updates);
        const isAllowed = requested_updates.every(up => allowed_updates.includes(up));

        if (!isAllowed) {
            return res.status(403).send({ error: "update not allowed" });
        }
        requested_updates.forEach(up => {
            user[up] = updates[up];
        })
        await user.save();
        res.status(200).send(user.getSecuredData());
    } catch (err) {
        res.status(500).send();
    }
})

//GET user by id - |anyone| 
router.get('/users/:id', auth, async (req, res) => {
    try {
        const id = req.params.id;
        const user = await User.findById(id);
        if (!user) {
            return res.status(404).send({ error: "user doesn't exits!" });
        }
        res.status(200).send(user.getSecuredDataWithProfile());
    } catch (err) {
        res.status(500).send(err);
    }
})
//GET me - |only me| 
router.get('/user/me', auth, async (req, res) => {
    try {
        const user = req.user
        res.status(200).send(user.getSecuredData());
    } catch (err) {
        res.status(500).send(err);
    }
})

//GET avatar - |any one| 
router.get("/user/:id/avatar", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user || !user.avatar) {
            return res.status(404).send()
        }
        res.set({
            "Content-Type": "image/png"
        }).send(user.avatar).status(200);

    } catch (error) {
        res.send().status(404);
    }
})


//DELETE - delete user by id - |only me|
router.delete('/user/me/delete', auth, async (req, res) => {
    try {
        const user = req.user
        const id = user._id;
        await Blog.deleteMany({ owner: id });
        await user.remove()
        res.status(200).send();
    } catch (err) {
        res.status(500).send(err);
    }
})

//POST /user/me/avatar - change my avatar - |only me|
router.post("/user/me/avatar", auth, upload.single("avatar"), async (req, res) => {
    console.log(req.body)
    try {
        const user = req.user;
        const file = req.file;
        const buffer = await sharp(file.buffer).resize({ width: 250, height: 250 }).png().toBuffer();
        user.avatar = buffer;
        await user.save();
        res.send('done!');
    } catch (err) {
        res.status(500).send(err);
    }
}, async (err, req, res, next) => {
    res.send({ error: err.message }).status(400)
})


module.exports = router;