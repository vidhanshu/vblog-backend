const Blog = require("../models/blog");
const Router = require("express").Router
const router = new Router();
const auth = require("../middleware/auth");
const multer = require("multer")
const sharp = require("sharp");

const upload = multer({
    limits: {
        fileSize: 1000000,
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/.(jpg|jpeg|svg|png|webp)$/)) {
            return cb(new Error("please upload jpg/jpeg/png/svg/webp"))
        }
        cb(undefined, true);
    }
})

/**
 * @params GET  ROUTES
 */

//GET /blog/:id - gives blog by id |any user|
router.get("/blog/:id", auth, async (req, res) => {
    const id = req.params.id;
    try {
        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).send({ error: 'not found' });
        }
        res.status(200).send(blog);
    } catch (err) {
        console.log(err)
        res.status(500).send(err);
    }
})

//GET /blog/all - gives all the blogs present in the database - any user
router.get("/blog/all/list", async (req, res) => {
    const { limit, skip, sortBy } = req.query;
    let sort = {};
    if (sortBy) {
        const sort_query = sortBy.split(":");
        sort[sort_query[0]] = sort_query[1];
    } else {
        sort = undefined;
    }

    try {
        const blogs = await Blog.find({}, {}, { limit, skip, sort });
        blogs.map(blog => {
            blog.text = blog.text.substring(0, 400);
        })
        res.status(200).send(blogs);
    } catch (err) {
        res.status(500).send(err);
    }
})

//GET /blog/all - gives all the blogs present in the database - any user
router.get("/blog/all", async (req, res) => {
    const { limit, skip, sortBy } = req.query;
    let sort = {};
    if (sortBy) {
        const sort_query = sortBy.split(":");
        sort[sort_query[0]] = sort_query[1];
    } else {
        sort = undefined;
    }

    try {
        const blogs = await Blog.find({}, {}, { limit, skip, sort });
        res.status(200).send(blogs);
    } catch (err) {
        res.status(500).send(err);
    }
})


//GET /blogs/user/:id - gives all blogs of user by user id |any user|
router.get("/blogs/user/:id", auth, async (req, res) => {
    const id = req.params.id;

    try {
        const blog = await Blog.find({ owner: id });
        if (!blog) {
            return res.status(404).send({ error: 'not found' });
        }
        res.status(200).send(blog);
    } catch (err) {
        res.status(500).send(err);
    }
})

//GET /blogs/:id/image - gives a image of blog by id |any user|
router.get("/blog/:id/image", async (req, res) => {
    const id = req.params.id;
    try {
        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).send({ error: "not found" });
        }
        let image = blog.image;
        if (!image) {
            image = "https://artsmidnorthcoast.com/wp-content/uploads/2014/05/no-image-available-icon-6.png";
            return res.status(200).send(image);
        }
        res.set({ 'Content-Type': 'image/jpeg' }).status(200).send(image);
    } catch (err) {
        res.status(500).send(err);
    }
})

/**
 * @params POST ROUTEs
 */

//POST /blog/publish
router.post("/blog/publish", auth, async (req, res) => {
    const data = req.body;
    const user = req.user;
    console.log(data);
    try {
        const blog = new Blog(data);
        console.log(data)
        blog.owner = user._id;
        const saved = await blog.save();
        res.status(200).send(saved);
    } catch (err) {
        res.status(500).send(err);
    }
})

//POST /blog/image
router.post("/blog/:id/image", auth, upload.single("blogImage"), async (req, res) => {
    const user = req.user;
    const file = req.file;
    const id = req.params.id;
    try {
        const blog = await Blog.findById(id);
        if (!blog || !file) {
            return res.status(404).send({ error: "not found" });
        }
        const buffer = await sharp(file.buffer).jpeg().toBuffer();
        blog.image = buffer;
        await blog.save()
        res.set('Content-Type', "image/jpeg").send(blog.image);
    } catch (err) {
        res.status(500).send();
    }
}, (err, req, res, next) => {
    console.log(err)
    res.status(500).send(err);
})

//POST /blog/update - update blog by id - |only my|
router.patch("/blog/:id/update", auth, async (req, res) => {
    const id = req.params.id;
    const user = req.user;
    const updates = req.body;
    const requested_updates = Object.keys(updates);
    const allowed_updates = ["title", "image", "text", "tags"];
    const isAllowed = requested_updates.every(up => allowed_updates.includes(up));
    if (!isAllowed) {
        return res.status(404).send({ error: "update not allowed" });
    }
    try {
        const updated_blog = await Blog.findOneAndUpdate({ owner: user._id, _id: id }, updates, { new: true });
        if (!updated_blog) {
            return res.status(404).send({ error: "not found" });
        }
        res.status(200).send(updated_blog);
    } catch (err) {
        res.status(500).send(err);
    }
})

//POST - increase claps - |any blog any user|
router.patch("/blog/:id/clap-inc", auth, async (req, res) => {
    const id = req.params.id
    try {
        const updated_blog = await Blog.findByIdAndUpdate(id, { $inc: { claps: 1 } }, { new: true });
        if (!updated_blog) {
            return res.status(404).send({ error: "not found" });
        }
        res.status(200).send(updated_blog);
    } catch (err) {
        res.status(500).send(err);
    }
})

//POST - decrease claps - |any blog any user|
router.patch("/blog/:id/clap-dec", auth, async (req, res) => {
    const id = req.params.id

    try {
        const updated_blog = await Blog.findByIdAndUpdate(id, { $inc: { claps: -1 } }, { new: true });
        if (!updated_blog) {
            return res.status(404).send({ error: "not found" });
        }
        res.status(200).send(updated_blog);
    } catch (err) {
        res.status(500).send(err);
    }
})

//DELETE /blog/:id
router.delete("/blog/:id/delete", auth, async (req, res) => {
    const user = req.user;
    const id = req.params.id
    try {
        const deleted_blog = await Blog.deleteOne({ owner: user._id, _id: id }, { new: true });
        if (!deleted_blog.deletedCount) {
            return res.status(404).send({ error: "no blog found" })
        }
        res.status(200).send()
    } catch (err) {
        console.log(err)
        res.status(500).send(err);
    }
})
module.exports = router;
