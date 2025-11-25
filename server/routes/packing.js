const express = require("express");
const router = express.Router();
const { getPackingList } = require("../controllers/packingController");
const auth = require("../middleware/auth");

router.get("/", auth, getPackingList); 

module.exports = router;
