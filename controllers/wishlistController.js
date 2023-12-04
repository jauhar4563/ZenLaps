const Wishlist = require("../models/wishlistModel");

// Add to Wishlist

const addToWishlist = async (req, res) => {
  try {
    if (!req.session.userData) {
      return res.status(401).json({ success: false, message: 'Please log in to add a product to wishlist' });
  }
      const userId = req.session.userData._id;
const productId = req.query.productId;
  let userWishlist = await Wishlist.findOne({ user: userId });

  if (!userWishlist) {
      userWishlist = new Wishlist({
          user: userId,
          items: [{ product: productId }],
      });
  } else {
      const existingWishlistItem = userWishlist.items.find((item) => item.product.toString() === productId);

      if (existingWishlistItem) {
          return res.status(400).json({success: false, message: 'Prduct already in wishlist' });
      } else {
          userWishlist.items.push({ product: productId });
      }
  }

  await userWishlist.save();
  res.status(200).json({ success: true, message: 'Product added to wishlist' });

  } catch (error) {
    console.error(error.message);
  }
};

// Wishlist Page

const loadWishlist = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const User = req.session.userData;
    const userWishlist = await Wishlist.findOne({ user: userId }).populate(
      "items.product"
    );

    const userWishlistItems = userWishlist ? userWishlist.items : [];
    res.render("wishlist", { User, Wishlist: userWishlistItems });
  } catch (err) {
    console.error("Error fetching user wishlist:", err);
  }
};

// remove From wishlist

const removeFromWishlist = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const productId = req.query.productId;

    const existingCart = await Wishlist.findOne({ user: userId });
    if (existingCart) {
      const updatedItems = existingCart.items.filter(
        (item) => item.product.toString() !== productId
      );

      existingCart.items = updatedItems;
      await existingCart.save();

      res.json({ success: true });
    } else {
      res.json({ success: false, error: "Whishlist not found" });
    }
  } catch (error) {
    console.error("Error removing cart item:", error);
  }
};

module.exports = {
  addToWishlist,
  loadWishlist,
  removeFromWishlist,
};
