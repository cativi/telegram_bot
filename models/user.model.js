const { Schema, model } = require('mongoose');

const userSchema = new Schema({
    telegram_id: String,
    is_bot: Boolean,
    first_name: String,
    last_name: String,
    username: String,
    language_code: String
}, {
    versionKey: false, timestamps: true
});

module.exports = model('user', userSchema);