const mongoose = require("mongoose")
const Schema = mongoose.Schema;

const tagsSchema = new Schema({
    name: {
        type: String,
        unique: true,
        required: true,
        toLowerCase: true,
    }
})

const Tag = mongoose.model('Tags', tagsSchema);

module.exports = Tag;