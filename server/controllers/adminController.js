const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Admin = require("../models/Admin");

// -------------------- REGISTER ADMIN --------------------
exports.registerAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const adminExists = await Admin.findOne({ email });
    if (adminExists) return res.status(400).json({ msg: "Admin already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAdmin = new Admin({ email, password: hashedPassword });
    await newAdmin.save();

    res.status(201).json({ msg: "Admin registered successfully" });
  } catch (err) {
    console.error("Register admin error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// -------------------- LOGIN ADMIN --------------------
exports.loginAdmin = async (req, res) => {
  const { email, password } = req.body;

  try {
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(400).json({ msg: "Admin not found" });

    const isMatch = await bcrypt.compare(password, admin.password);
    if (!isMatch) return res.status(400).json({ msg: "Invalid credentials" });

    const token = jwt.sign(
      { id: admin._id, email: admin.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.json({ token });
  } catch (err) {
    console.error("Login admin error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};

// -------------------- GET CURRENT ADMIN --------------------
exports.getCurrentAdmin = async (req, res) => {
  try {
    const admin = await Admin.findById(req.admin.id).select("-password");
    if (!admin) return res.status(404).json({ msg: "Admin not found" });

    res.json(admin);
  } catch (err) {
    console.error("Get current admin error:", err);
    res.status(500).json({ msg: "Server error" });
  }
};
