const Cart = require("../models/cartModel");
const Wishlist = require("../models/wishlistModel");
const {
  calculateSubtotal,
  calculateProductTotal,
} = require("../helpers/helper");

// Add to cart

const addTocart = async (req, res) => {
  try {

    if (!req.session || !req.session.userData || !req.session.user_id || !req.session.userData._id) {
      return res.status(401).json({ success: false, message: 'Please log in to add a product to cart' });
    }
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
    res.status(200).json({ success: true, message: 'Product added to cart' });
  } catch (error) {
    console.error("Error adding product to cart:", error);
  }
};

// Function for loading cart page
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

// Function for updating cart count

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

        // Calculate and send updated item total and total amount in the response
        const newItemTotal = calculateItemTotal(existingCartItem.product, newQuantity);
        const newTotalAmount = calculateTotalAmount(existingCart.items);

        res.json({ success: true, newItemTotal, newTotalAmount });
      } else {
        res.json({ success: false, error: "Cart item not found" });
      }
    } else {
      res.json({ success: false, error: "Cart not found" });
    }
  } catch (error) {
    console.error("Error updating cart:", error);
    res.json({ success: false, error: "Internal server error" });
  }
};

// Example function to calculate item total
function calculateItemTotal(product, quantity) {
  // Log values for troubleshooting
  console.log('Product:', product);
  console.log('Quantity:', quantity);

  const priceToConsider = product.discountStatus ? product.discountPrice : product.price;
  console.log('Price To Consider:', priceToConsider);

  // Modify this function based on your item total calculation logic
  const itemTotal = (priceToConsider * quantity).toFixed(2);

  return itemTotal;
}


// Example function to calculate total amount
async function calculateTotalAmount(cartItems) {
  try {
    // Populate the product field to get the actual product data
    const populatedCartItems = await Cart.populate(cartItems, { path: 'product' });

    // Log values for troubleshooting
    console.log('Populated Cart Items:', populatedCartItems);

    const totalAmount = populatedCartItems.reduce((total, item) => {
      // Use populated item.product to get the actual product object
      const product = item.product;
      
      // Add checks to ensure product and priceToConsider are valid
      if (product && product.discountStatus !== undefined && product.price !== undefined) {
        const priceToConsider = product.discountStatus ? product.discountPrice : product.price;
        
        // Add checks to ensure priceToConsider is a valid number
        if (!isNaN(priceToConsider)) {
          console.log('Item:', item);
          console.log('Price To Consider:', priceToConsider);

          return total + (priceToConsider * item.quantity);
        } else {
          console.error('Invalid priceToConsider:', priceToConsider);
          return total;
        }
      } else {
        console.error('Invalid product:', product);
        return total;
      }
    }, 0);

    console.log('Total Amount:', totalAmount);

    return totalAmount.toFixed(2);
  } catch (error) {
    console.error('Error populating cart items:', error);
    return '0.00';
  }
}



// Function for removing items from the cart

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

      res.json({ success: true, toaster: true });
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
