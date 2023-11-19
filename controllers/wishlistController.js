const Wishlist = require("../models/wishlistModel");



// Add to Wishlist

const addToWishlist = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const productId = req.query.productId;

    const wishlist = await Wishlist.findOne({ user: userId }).populate(
      "items.product"
    );

    if (wishlist) {
      const existingWishlistItem = wishlist.items.find(
        (item) => item.product._id.toString() === productId
      );

      if (existingWishlistItem) {
        return res.redirect("/productsShop");
      }

      wishlist.items.push({ product: productId });
      await wishlist.save();
    } else {
      const newWishlist = new Wishlist({
        user: userId,
        items: [{ product: productId }],
      });
      await newWishlist.save();
    }
    if (req.query.viewProduct) {
      res.redirect(`/productView?id=${productId}`);
    } else {
      res.redirect("/productsShop");
    }
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
