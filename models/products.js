const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
    id: String,
    name: String,
    description: String,
    price: Number,
    imagePath:String,
    category: String,
    pet: String
});

module.exports = mongoose.model('Product', productSchema);
