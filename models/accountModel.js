const mongoose = require("mongoose")

const accountSchema = mongoose.Schema(
    {
      username:String,
      password:String,
      email:String,
      name:String,
      last_name:String,
    }
);

module.exports = mongoose.model('Account', accountSchema, 'Account'); // Capital "P" to match your MongoDB collection
