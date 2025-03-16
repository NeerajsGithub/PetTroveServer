const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
    name: String,
    vaccinationCount: { type: Number, default: 0 },
    checkupCount: { type: Number, default: 0 },
    exerciseCount: { type: Number, default: 0 },
    feedingCount: { type: Number, default: 0 },
  });
  

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    blogs: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog'
    }],
    pets: [petSchema],
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

module.exports = User;
