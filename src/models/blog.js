const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const BlogSchema = new Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    image: {
        type: Buffer,
    },
    text: {
        type: String,
        require: true,
    },
    tags: {
        tag: {
            type: String,
        }
    },
    claps: {
        type: Number,
        default: 0,
        min: 0
    },
    owner: {
        ref: "User",
        type: Schema.Types.ObjectId,
        required: true,
    }
}, { timestamps: true })

BlogSchema.virtual('comments', {
    ref: "Comment",
    localField: "_id",
    foreignField: "blog"
})

const Blog = mongoose.model("Blog", BlogSchema);
module.exports = Blog;