const mongoose = require('mongoose');

// Define the schema for the order
const orderSchema = new mongoose.Schema({
  userId: {
    type: String,
    ref: 'User',  // Assuming you have a 'User' model
    required: true
  },
  orders: [
    {
      products: [
        {
          id: {
            type: String,
            required: true
          },
          title: {
            type: String,
            required: true
          },
          description: {
            type: String,
            required: true
          },
          price: {
            type: Number,
            required: true
          },
          category: {
            type: String,
            required: true
          },
          pet: {
            type: String,
            required: true
          },
          imagePath: {
            type: String,
            required: true
          },
        }
      ],
      orderDate: {
        type: Date,
        default: Date.now
      }
    }
  ]
});

// Create and export the Order model
const Order = mongoose.model('Order', orderSchema);
module.exports = Order;
