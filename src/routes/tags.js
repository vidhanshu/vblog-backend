const express = require("express")
const router = new express.Router();
const Tag = require("../models/tags");


router.get("/tags/all", async (req, res) => {
    try {
        const all = await Tag.find({}, {}, { limit: 100 });
        res.send(all);
    } catch (err) {
        res.status(500).send();
    }
})

router.post("/tag/post", async (req, res) => {
    try {
        const tag = new Tag(req.body);
        await tag.save();
        res.send(await Tag.find({}, {}, { limit: 100 }));
    } catch (err) {
        res.status(409).send(err)
    }
})

module.exports = router;