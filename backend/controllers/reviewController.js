import Review from '../models/Review.js';
import Product from '../models/Product.js';

// Helper function to update product average rating
const updateProductRating = async (productId) => {
  const reviews = await Review.find({ product: productId });
  const numReviews = reviews.length;
  const rating =
    numReviews > 0
      ? Number((reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews).toFixed(1))
      : 0;

  await Product.findByIdAndUpdate(productId, {
    rating,
    numReviews,
  });
};

// @desc    Create a product review
// @route   POST /api/products/:id/reviews
// @access  Private
export const createProductReview = async (req, res) => {
  try {
    const { rating, comment } = req.body;

    if (!rating || !comment) {
      return res.status(400).json({ success: false, message: 'Please provide rating and comment' });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // Check if user already reviewed
    const alreadyReviewed = await Review.findOne({
      user: req.user._id,
      product: req.params.id,
    });

    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'Product already reviewed by you' });
    }

    const review = await Review.create({
      user: req.user._id,
      product: req.params.id,
      rating: Number(rating),
      comment,
    });

    await updateProductRating(req.params.id);

    return res.status(201).json({ success: true, data: review });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get reviews for a product
// @route   GET /api/products/:id/reviews
// @access  Public
export const getProductReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.id })
      .populate('user', 'name')
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: reviews });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete a review (Admin or Owner)
// @route   DELETE /api/reviews/:id
// @access  Private/Admin
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ success: false, message: 'Review not found' });
    }

    // Allow Admin or the user who created it to delete
    if (req.user.role !== 'admin' && review.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this review' });
    }

    const productId = review.product;
    await Review.deleteOne({ _id: req.params.id });

    // Recalculate rating
    await updateProductRating(productId);

    return res.json({ success: true, message: 'Review deleted successfully' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
