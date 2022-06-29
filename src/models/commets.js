const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const CommentSchema = new Schema({
    user: {
        _id: Schema.Types.ObjectId,
        required: true,
    },
    blog: {
        ref: "Blog",
        _id: Schema.Types.ObjectId
    },
    text: {
        type: String,
        required: true,
    }
}, { timestamps: true })

const Comment = mongoose.model("Comment", CommentSchema);
module.exports = Comment;