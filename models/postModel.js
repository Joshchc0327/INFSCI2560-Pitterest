const { Timestamp } = require("mongodb")
const mongoose = require("mongoose")

const postSchema = mongoose.Schema(
    {
        title: String,
        description: String,
        location: String,
        link: String,
        category: String,
        userid: String
    },
    {
        versionKey: false, // Disables versioning for this schema
        timestamps: true // Add createdAt and updatedAt fields
    }
);

module.exports = mongoose.model('Post', postSchema, 'Post'); // Capital "P" to match your MongoDB collection
