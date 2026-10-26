const Design = require("../models/Design");

// ADD DESIGN
const addDesign = async (req, res) => {
  try {
    const {
      tailor,
      title,
      category,
      price,
      description,
      image,
    } = req.body;

    if (!tailor || !title || !category || price === undefined || !image) {
      return res.status(400).json({
        message: "Tailor, title, category, price and image are required.",
      });
    }

    const design = await Design.create({
      tailor,
      title,
      category,
      price,
      description,
      image,
    });

    return res.status(201).json({
      message: "Design added successfully.",
      design,
    });
  } catch (error) {
    console.error("ADD DESIGN ERROR:", error);

    return res.status(500).json({
      message: "Unable to add design.",
    });
  }
};

// GET DESIGNS OF A TAILOR
const getTailorDesigns = async (req, res) => {
  try {
    const { tailorId } = req.params;

    const designs = await Design.find({
      tailor: tailorId,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      designs,
    });
  } catch (error) {
    console.error("GET DESIGNS ERROR:", error);

    return res.status(500).json({
      message: "Unable to fetch designs.",
    });
  }
};

// UPDATE DESIGN
const updateDesign = async (req, res) => {
  try {
    const { id } = req.params;

    const {
      title,
      category,
      price,
      description,
      image,
    } = req.body;

    const design = await Design.findById(id);

    if (!design) {
      return res.status(404).json({
        message: "Design not found.",
      });
    }

    if (title !== undefined) design.title = title;
    if (category !== undefined) design.category = category;
    if (price !== undefined) design.price = price;
    if (description !== undefined) design.description = description;
    if (image !== undefined) design.image = image;

    await design.save();

    return res.status(200).json({
      message: "Design updated successfully.",
      design,
    });
  } catch (error) {
    console.error("UPDATE DESIGN ERROR:", error);

    return res.status(500).json({
      message: "Unable to update design.",
    });
  }
};

// DELETE DESIGN
const deleteDesign = async (req, res) => {
  try {
    const { id } = req.params;

    const design = await Design.findByIdAndDelete(id);

    if (!design) {
      return res.status(404).json({
        message: "Design not found.",
      });
    }

    return res.status(200).json({
      message: "Design deleted successfully.",
    });
  } catch (error) {
    console.error("DELETE DESIGN ERROR:", error);

    return res.status(500).json({
      message: "Unable to delete design.",
    });
  }
};

module.exports = {
  addDesign,
  getTailorDesigns,
  updateDesign,
  deleteDesign,
};