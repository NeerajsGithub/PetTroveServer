const express = require("express");
const Blog = require("../models/blog.js");
const router = express.Router();

// Upload Blog
router.post("/upload", async (req, res) => {
  const { userId, name, title, description, imagePath, date } = req.body;

  if (!userId || !name || !title || !description || !imagePath || !date) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    const existingBlog = await Blog.findOne({ title });

    if (existingBlog) {
      existingBlog.title = title;
      existingBlog.description = description;
      existingBlog.imagePath = imagePath;
      existingBlog.date = date;
      await existingBlog.save();
      return res.status(200).json({ message: "Blog updated successfully", blog: existingBlog });
    }

    const newBlog = new Blog({ userId, name, title, description, imagePath, date: new Date(date) });
    await newBlog.save();
    res.status(200).json({ message: "Blog created successfully", blog: newBlog });
  } catch (err) {
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Get Blogs
router.get("/", async (req, res) => {
  try {
    const blogs = await Blog.find();
    res.status(200).json(blogs);
  } catch (error) {
    res.status(500).json({ message: "Error fetching blogs" });
  }
});

module.exports = router;
