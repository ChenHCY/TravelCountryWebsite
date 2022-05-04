var mongoose = require("mongoose");

var commentSchema = mongoose.Schema({
    countryName: { type: String, require: true },
    state: { type: mongoose.Schema.Types.Array, require: false },
    startDate: { type: String, require: false },
    endDate: { type: String, require: false },
    tag: { type: String, require: false },
    details: { type: String, require: false },
    image: { type: Array, require: false, unique: false },
    userID: { type: mongoose.Schema.Types.ObjectId, require: false, unique: false }, // ObjectId means reference to an id
    travelFeeling: { type: String, require: false },
    like: { type: Number, require: false, default: 0 },
    createAt: { type: Date, default: Date.now }
});

var Comment = mongoose.model("Comment", commentSchema);
module.exports = Comment;
