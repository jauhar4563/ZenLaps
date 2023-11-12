const Cart = require("../models/cartModel");
const Wishlist = require("../models/wishlistModel");
const {
  calculateSubtotal,
  calculateProductTotal,
} = require("../helpers/helper");

// Add to cart

const addTocart = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const productId = req.query.productId;
    const { qty } = req.body;

    const existingCart = await Cart.findOne({ user: userId });
    let newCart = {};

    if (existingCart) {
      const existingCartItem = existingCart.items.find(
        (item) => item.product.toString() === productId
      );

      if (existingCartItem) {
        existingCartItem.quantity += parseInt(qty);
      } else {
        existingCart.items.push({
          product: productId,
          quantity: parseInt(qty),
        });
      }

      existingCart.total = existingCart.items.reduce(
        (total, item) => total + (item.quantity || 0),
        0
      );

      await existingCart.save();
    } else {
      newCart = new Cart({
        user: userId,
        items: [{ product: productId, quantity: parseInt(qty) }],
        total: parseInt(qty, 10),
      });

      await newCart.save();
    }
    const userWishlist = await Wishlist.findOne({ user: userId });
    if (userWishlist) {
      const wishlistItemIndex = userWishlist.items.findIndex(
        (item) => item.product.toString() === productId
      );
      if (wishlistItemIndex !== -1) {
        userWishlist.items.splice(wishlistItemIndex, 1);
        await userWishlist.save();
      }
    }
    req.session.cartLength = (existingCart || newCart).items.length;
    if (req.query.viewProduct) {
      res.redirect(`/productView?id=${productId}`);
    } else if (req.query.wishlist) {
      res.redirect("/wishlist");
    } else {
      res.redirect("/productsShop");
    }
  } catch (error) {
    console.error("Error adding product to cart:", error);
  }
};

const loadCart = async (req, res) => {
  try {
    const userData = req.session.userData;
    const userId = userData._id;
    const userCart = await Cart.findOne({ user: userId }).populate(
      "items.product"
    );

    const cart = userCart ? userCart.items : [];
    const subtotal = calculateSubtotal(cart);
    const productTotal = calculateProductTotal(cart);
    const subtotalWithShipping = subtotal;

    let outOfStockError = false;

    if (cart.length > 0) {
      for (const cartItem of cart) {
        const product = cartItem.product;

        if (product.quantity < cartItem.quantity) {
          outOfStockError = true;
          break;
        }
      }
    }
    let maxQuantityErr = false;
    if (cart.length > 0) {
      for (const cartItem of cart) {
        const product = cartItem.product;

        if (cartItem.quantity > 2) {
          maxQuantityErr = true;
          break;
        }
      }
    }

    res.render("cart", {
      User: userData,
      cart,
      productTotal,
      subtotalWithShipping,
      outOfStockError,
      maxQuantityErr,
    });
  } catch (error) {
    console.log(error.message);
  }
};

const updateCartCount = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const productId = req.query.productId;
    const newQuantity = parseInt(req.query.quantity);

    const existingCart = await Cart.findOne({ user: userId });
    if (existingCart) {
      const existingCartItem = existingCart.items.find(
        (item) => item.product.toString() === productId
      );

      if (existingCartItem) {
        existingCartItem.quantity = newQuantity;
        existingCart.total = existingCart.items.reduce(
          (total, item) => total + (item.quantity || 0),
          0
        );

        await existingCart.save();
      }

      res.json({ success: true });
    } else {
      res.json({ success: false, error: "Cart not found" });
    }
  } catch (error) {
    console.error("Error updating cart:", error);
    res.json({ success: false, error: "Internal server error" });
  }
};

const removeFromCart = async (req, res) => {
  try {
    const userId = req.session.user_id;
    const productId = req.query.productId;

    const existingCart = await Cart.findOne({ user: userId });
    if (existingCart) {
      const updatedItems = existingCart.items.filter(
        (item) => item.product.toString() !== productId
      );

      existingCart.items = updatedItems;
      existingCart.total = updatedItems.reduce(
        (total, item) => total + (item.quantity || 0),
        0
      );

      await existingCart.save();

      res.json({ success: true });
    } else {
      res.json({ success: false, error: "Cart not found" });
    }
  } catch (error) {
    console.error("Error removing cart item:", error);
    res.json({ success: false, error: "Internal server error" });
  }
};

module.exports = {
  addTocart,
  loadCart,
  updateCartCount,
  removeFromCart,
};
