const express = require("express");
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth.js");
const blogRoutes = require("./routes/blog.js");
const orderRoutes = require("./routes/order.js");
const productRoutes = require("./routes/product.js");
const { otpStore, OTP_EXPIRY_DURATION } = require("./data/optStore.js");
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose
  .connect("mongodb://localhost:27017/PetTrove", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

// Routes
app.use("/auth", authRoutes);
app.use("/blog", blogRoutes);
app.use("/order", orderRoutes);
app.use("/product", productRoutes);

// Clean expired OTPs every 5 seconds
setInterval(() => {
  const currentTime = Date.now();
  Object.keys(otpStore).forEach(email => {
    const { timestamp } = otpStore[email];
    if (currentTime - timestamp > OTP_EXPIRY_DURATION) {
      delete otpStore[email]; // Remove expired OTP
      console.log(`OTP for ${email} expired and removed.`);
    }
  });
}, 5000);

// Start server
const PORT = 80;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});