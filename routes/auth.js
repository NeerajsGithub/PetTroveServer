const express = require("express");
const User = require("../models/user.js");
const { otpStore, OTP_EXPIRY_DURATION } = require("../data/optStore.js");
const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const router = express.Router();

// Email Transporter using SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Generate & Send OTP
const sendOtpEmail = async (email, subject, templatePath, userName, otp) => {
  try {
    const htmlTemplate = fs.readFileSync(path.join(__dirname, templatePath), "utf-8");
    let htmlContent = htmlTemplate.replace("{{otp}}", otp).replace("{{username}}", userName || "User");

    await transporter.sendMail({
      from: `"PetTrove" <${process.env.EMAIL_USER}>`,
      to: email,
      subject,
      html: htmlContent,
    });

    console.log(`OTP sent to ${email}`);
  } catch (error) {
    console.error("Failed to send OTP email:", error);
  }
};

// 📌 User Registration
router.post("/register", async (req, res) => {
  const { name, email, password, phone , pets } = req.body;

  if (!name || !email || !password || !phone) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const newUser = new User({ name, email, password, phone , pets });
    await newUser.save();

    res.status(200).json({
      message: "Registration successful",
      userId: newUser._id,
      name: newUser.name,
      email: newUser.email,
      pets : newUser.pets,
    });

  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// 📌 User Login
router.post("/authenticate", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ message: "Missing required fields" });

  try {
    const user = await User.findOne({ email });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: "Authentication failed" });
    }

    res.status(200).json({
      message: "Authentication successful",
      userId: user._id,
      name: user.name,
      email: user.email,
      pets : user.pets,
    });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.post('/update-pet-stats', async (req, res) => {
  const { userId, pets } = req.body;

  if (!userId || !pets) {
    return res.status(400).json({ message: 'Invalid data provided' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update pets data
    user.pets = pets;

    await user.save();

    res.status(200).json({
      message: 'Pet stats updated successfully',
      pets: user.pets,
    });
  } catch (err) {
    console.error('Error updating pet stats:', err);
    res.status(500).json({ message: 'Failed to update pet stats' });
  }
});

// 📌 Send OTP for Password Reset
router.post("/getForgetRequest", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) return res.status(404).json({ error: "User not found. Please provide a valid email." });

  const otp = Math.floor(1000 + Math.random() * 9000);
  otpStore[email] = { storedOtp: otp, timestamp: Date.now() };

  await sendOtpEmail(email, "Password Reset OTP", "../templates/otp-template.html", user.name, otp);
  res.status(200).json({ message: "OTP sent for password reset." });
});

router.post('/update-pets', async (req, res) => {
  const { userId, pets } = req.body;

  if (!userId || !pets) {
    return res.status(400).json({ message: 'User ID and pets are required' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.pets = pets;
    await user.save();

    res.status(200).json({
      message: 'Pets updated successfully',
      pets: user.pets,
    });
  } catch (err) {
    console.error('Update error:', err);
    res.status(500).json({ message: 'Server error' });
  }
});


// 📌 Email Verification OTP
router.post("/emailVerification", async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (user) return res.status(409).json({ error: "Email already registered." });

  const otp = Math.floor(1000 + Math.random() * 9000);
  otpStore[email] = { storedOtp: otp, timestamp: Date.now() };

  await sendOtpEmail(email, "Email Verification OTP", "../templates/mail-verification.html", "User", otp);
  res.status(200).json({ message: "Verification OTP sent successfully." });
});

// 📌 Verify OTP
router.post("/verify-otp", (req, res) => {
  const { email, otp } = req.body;

  if (!otpStore[email]) return res.status(400).json({ error: "OTP not found" });

  const { storedOtp, timestamp } = otpStore[email];
  if (Date.now() - timestamp > OTP_EXPIRY_DURATION) {
    delete otpStore[email];
    return res.status(400).json({ error: "OTP has expired" });
  }

  if (storedOtp == otp) {
    delete otpStore[email];
    return res.status(200).json({ message: "OTP verified successfully" });
  } else {
    return res.status(400).json({ error: "Invalid OTP" });
  }
});

// 📌 Reset Password
router.post("/reset-password", async (req, res) => {
  const { email, pass } = req.body;
  if (!email || !pass) return res.status(400).json({ error: "Email and new password are required" });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ error: "User not found" });

    user.password = pass;
    await user.save();
    res.status(200).json({ message: "Password reset successful" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
