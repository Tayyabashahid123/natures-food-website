const express = require("express");
const auth = require("../middleware/auth");
const {
  registerAdmin,
  loginAdmin,
  getCurrentAdmin
} = require("../controllers/adminController");

const router = express.Router();

// Routes
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.get("/me", auth, getCurrentAdmin);

module.exports = router;
