const mongoose = require('mongoose');
const { Schema } = mongoose

const UserSchema = new Schema({
    username: { type: String, unique: true, required: true },
    password: { type: String, required: true },
})

const UserModel = mongoose.model('User', UserSchema);


module.exports = UserModel;