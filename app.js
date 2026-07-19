const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");

const app = express();

// Middleware
app.use(express.json());
app.use(cors());

// MongoDB Connection
mongoose
  .connect("mongodb://127.0.0.1:27017/StudentMay")
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

// Schema
const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
  },
});

// Model
const User = mongoose.model("User", UserSchema);

// Home Route
app.get("/", (req, res) => {
  res.send("API Running...");
});

// Register Route
app.post("/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Validation
    if (!username || !email || !password) {
      return res.json({
        message: "All fields are required",
      });
    }

    // Check Existing User
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.json({
        message: "User already exists",
      });
    }

    // Hash Password
    const hashPassword = await bcrypt.hash(password, 10);

    // Create User
    const newUser = new User({
      username,
      email,
      password: hashPassword,
    });

    await newUser.save();

    res.json({
      message: "User Created Successfully",
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

// Login Route
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find User
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({
        message: "User Not Found",
      });
    }

    // Compare Password
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.json({
        message: "Incorrect Password",
      });
    }

    res.json({
      message: "Login Successfully",
      username: user.username,
    });
  } catch (err) {
    console.log(err);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

// Server
const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Server Running at http://localhost:${PORT}`);
});