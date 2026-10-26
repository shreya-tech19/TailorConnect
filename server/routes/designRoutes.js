const express = require("express");

const {
  addDesign,
  getTailorDesigns,
  updateDesign,
  deleteDesign,
} = require("../controllers/designController");

const router = express.Router();

router.post("/", addDesign);

router.get("/tailor/:tailorId", getTailorDesigns);

router.patch("/:id", updateDesign);

router.delete("/:id", deleteDesign);

module.exports = router;