const express = require("express");
const mysql = require("mysql");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

// Database Connection
const db = mysql.createConnection({
    host: "localhost",
    user: "root",   // Change to your MySQL username
    password: "mypassword",   // Change to your MySQL password
    database: "blockchain_auth"
});

db.connect(err => {
    if (err) throw err;
    console.log("✅ Database Connected!");
});

// 🔹 User Signup Route
app.post("/signup", async (req, res) => {
    const { email, password, wallet_address } = req.body; // ✅ Fixed Typo

    try {
        // Hash Password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert User
        const query = "INSERT INTO users (email, password, wallet_address) VALUES (?, ?, ?)";
        db.query(query, [email, hashedPassword, wallet_address], (err, result) => {
            if (err) return res.status(400).json({ error: "❌ User already exists!" });
            res.json({ message: "✅ Signup Successful!" });
        });

    } catch (error) {
        console.error("Signup Error:", error);
        res.status(500).json({ error: "❌ Internal Server Error!" });
    }
});


// 🔹 User Login Route
app.post("/login", (req, res) => {
    const { email, password } = req.body;
    const query = "SELECT * FROM users WHERE email = ?";

    db.query(query, [email], async (err, results) => {
        if (err || results.length === 0) return res.status(400).json({ error: "User not found!" });

        const user = results[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(401).json({ error: "Invalid password!" });

        // Generate JWT Token
        const token = jwt.sign({ id: user.id }, "your_secret_key", { expiresIn: "1h" });
        res.json({ message: "✅ Login Successful!", token });
    });
});

// Start Server
app.listen(5000, () => console.log("🚀 Server running on port 5000"));
