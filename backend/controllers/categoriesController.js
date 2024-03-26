const asyncHandler = require("express-async-handler");
const { Category, validateCreateCategory } = require("../models/Category");

/**----------------------------------------------------------------
 *  @desc Create New Category
 *  @route /api/categories
 *  @method POST
 *  @access private (only admin)
 -----------------------------------------------------------------*/
module.exports.createCategoryCtrl = asyncHandler(async (req, res) => {
  // 1. validateion
  const { error } = validateCreateCategory(req.body);
  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  // 2. Create new category in categories DB
  const category = await Category.create({
    user: req.user.id,
    title: req.body.title,
  });

  // 4. Send response to client
  res.status(201).json(category);
});

/**----------------------------------------------------------------
 *  @desc Get All Categories
 *  @route /api/categories
 *  @method GET
 *  @access public
 -----------------------------------------------------------------*/
module.exports.getAllCategoriesCtrl = asyncHandler(async (req, res) => {
  // 1. Get all categories list
  const categories = await Category.find();

  // 4. Send response to client
  res.status(200).json(categories);
});

/**----------------------------------------------------------------
 *  @desc Delete Category
 *  @route /api/categories/:id
 *  @method DELETE
 *  @access private (only admin)
 -----------------------------------------------------------------*/
module.exports.deleteCategoryCtrl = asyncHandler(async (req, res) => {
  // 1. Get category information list
  const category = await Category.findById(req.params.id);
  if (!category) return res.status(404).json({ message: "category not found" });
  // 2. delete category from DB
  await Category.findByIdAndUpdate(req.params.id);
  // 4. Send response to client
  res
    .status(200)
    .json({
      message: "category deleted successfully",
      categoryId: category._id,
    });
});
