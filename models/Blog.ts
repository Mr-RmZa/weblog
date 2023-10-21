import mongoose from "mongoose";

const blogSchmea = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
    minlength: 5,
    maxlength: 255
  },
  body: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: "public",
    enum: ["public", "privet"]
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export const Blog = mongoose.model("Blog", blogSchmea);
