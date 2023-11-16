const Order = require("../models/orderModel");
const Category = require("../models/categoryModel");
const User = require("../models/userModel");
const Cart = require("../models/cartModel");
const Address = require("../models/addressModel");
const Product = require("../models/productModel");
const Razorpay = require('razorpay')
require("dotenv").config();
const  {RAZORPAY_ID_KEY,RAZORPAY_SECRET_KEY} = process.env;
const {
  calculateSubtotal,
  calculateProductTotal,
} = require("../helpers/helper");

const razorpay = new Razorpay({
  key_id:RAZORPAY_ID_KEY,
  key_secret:RAZORPAY_SECRET_KEY
})

// Render checkout page

const loadCheckout = async (req, res) => {
  try {
    const userId = req.session.user_id;

    const user = await User.findById(userId);

    if (!user) {
      console.log("User not found.");
    }

    const cart = await Cart.findOne({ user: userId })
      .populate({
        path: "items.product",
        model: "Product",
      })
      .exec();

    const address = await Address.find({ user: userId });

    if (!cart) {
      console.log("Cart not found.");
    }
    const cartItems = cart.items || [];

    const subtotal = calculateSubtotal(cartItems);
    const productTotal = calculateProductTotal(cartItems);
    const subtotalWithShipping = subtotal + 100;
    const outOfStockError = cartItems.some(
      (item) => cart.quantity < item.quantity
    );
    const maxQuantityErr = cartItems.some((item) => cart.quantity > 2);

    res.render("checkout", {
      User: user,
      cart: cartItems,
      subtotal,
      productTotal,
      subtotalWithShipping,
      address,
      outOfStockError,
      maxQuantityErr,
    });
  } catch (err) {
    console.error("Error fetching user data and addresses:", err);
  }
};

const postCheckout = async (req, res) => {
  const userId = req.session.user_id;
  const { address, paymentMethod } = req.body;
  const payment = paymentMethod
  try {
    const user = await User.findById(userId);
    const cart = await Cart.findOne({ user: userId })
      .populate({
        path: "items.product",
        model: "Product",
      })
      .populate("user");

    if (!user || !cart) {
      console.error("User or cart not found.");
    }

    const cartItems = cart.items || [];
    let totalAmount = 0;

    for (const cartItem of cartItems) {
      const product = cartItem.product;

      if (!product) {
        return res.render("orderFailed", {
          User: user,
          error: "Product not Found",
        });
      }

      if (product.quantity < cartItem.quantity) {
        return res.render("orderFailed", {
          User: user,
          error: "Product Out Of Stock",
        });
      }

      product.quantity -= cartItem.quantity;
      const GST = (18 / 100) * totalAmount;

      const itemTotal = product.discountPrice * cartItem.quantity + GST;
      totalAmount += parseFloat(itemTotal.toFixed(2));

      await product.save();
    }
    if (payment === "Wallet") {
      if (totalAmount <= user.walletBalance) {
        user.walletBalance -= totalAmount;
        await user.save();
      } else {
        return res.render("orderFailed", {
          User: user,
          error: "Insufficient Wallet Balance",
        });
      }
    }

    const order = new Order({
      user: userId,
      address: address,
      orderDate: new Date(),
      status: "Pending",
      paymentMethod: payment,
      deliveryDate: new Date(new Date().getTime() + 8 * 24 * 60 * 60 * 1000),
      totalAmount: totalAmount,
      items: cartItems.map((cartItem) => ({
        product: cartItem.product._id,
        quantity: cartItem.quantity,
        price: cartItem.product.discountPrice,
      })),
    });



    await order.save();
    
    if(payment=='Online Payment'){      
      const options = {

        amount: totalAmount,
        currency: 'INR',
        receipt: order._id,
      };
  
      razorpay.orders.create(options, async (err, razorpayOrder) => {
        if (err) {
          console.error('Error creating Razorpay order:', err);
          return res.status(500).json({ error: 'An error occurred while placing the order.' });
        } else {
          
          return res.status(200).json({ message: 'Order placed successfully.', order: razorpayOrder });
        }
      });
    }
    await Cart.deleteOne({ user: userId });
    res.status(200).json({success:true,payMethod:"COD"})
    // res.redirect("/orderSuccess");
  } catch (error) {
    console.error("Error placing the order:", error);
  }
};

const loadOrderSuccess = async (req, res) => {
  try {
    const user = req.session.userData;

    const order = await Order.findOne({ user: user._id })
      .populate("user")
      .populate({
        path: "address",
        model: "Address",
      })
      .populate({
        path: "items.product",
        model: "Product",
      })
      .sort({ orderDate: -1 });
    res.render("orderSuccess", { order, User: user });
  } catch (error) {
    console.error("Error fetching order details:", error);
  }
};

const loadOrderHistory = async (req, res) => {
  try {
    const User = req.session.userData;
    const page = parseInt(req.query.page) || 1;
    const limit = 10;
    const totalCount = await Order.countDocuments();

    const totalPages = Math.ceil(totalCount / limit);

    const order = await Order.find({ user: User._id })
      .populate("user")
      .populate({
        path: "address",
        model: "Address",
      })
      .populate({
        path: "items.product",
        model: "Product",
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ orderDate: -1 })
      .sort({ orderDate: -1 });
    res.render("orderHistory", { order, User, totalPages, currentPage: page });
  } catch (error) {
    console.log(error.message);
  }
};

const orderDetails = async (req, res) => {
  try {
    const User = req.session.userData;
    const orderId = req.query.orderId;
    const order = await Order.findOne({ _id: orderId })
      .populate("user")
      .populate({
        path: "address",
        model: "Address",
      })
      .populate({
        path: "items.product",
        model: "Product",
      });
    res.render("orderDetails", { orders: order, User });
  } catch (error) {
    console.log(error.message);
  }
};

const adminOrderDetails = async (req, res) => {
  try {
    const admin = req.session.adminData;
    const orderId = req.query.orderId;
    const order = await Order.findOne({ _id: orderId })
      .populate("user")
      .populate({
        path: "address",
        model: "Address",
      })
      .populate({
        path: "items.product",
        model: "Product",
      });
    res.render("adminOrderDetails", { orders: order, admin });
  } catch (error) {
    console.log(error.message);
  }
};

const changeOrderStatus = async (req, res) => {
  try {
    const OrderStatus = req.query.status;
    const orderId = req.query.orderId;
    const order = await Order.findById(orderId).populate({
      path: "items.product",
      model: "Product",
    });
    if (OrderStatus == "Cancelled") {

      for (const item of order.items) {
        const productId = item.product._id;
        const orderedQuantity = item.quantity;
        const product = await Product.findById(productId);

        if (product) {
          product.quantity += orderedQuantity;
          await product.save();
        }
      }
    }
    order.status = OrderStatus;

    await order.save();

    if (req.query.orderDetails) {
      res.redirect(`/admin/orderDetails?orderId=${orderId}`);
    } else if (order.status == "Return Requested") {
      res.redirect(`/orderDetails?orderId=${orderId}`);
    } else {
      res.redirect("/admin/orderList");
    }
  } catch (error) {
    console.log(error.message);
  }
};

const returnOrder = async (req, res) => {
  try {
    const orderId = req.query.orderId;
    const order = await Order.findOne({ _id: orderId })
      .populate("user")
      .populate({
        path: "items.product",
        model: "Product",
      });

    if (!order) {
      return res.status(404).send("Order not found");
    }

    const user = order.user;
    user.walletBalance += order.totalAmount;
    await user.save();

    for (const item of order.items) {
      const productId = item.product._id;
      const orderedQuantity = item.quantity;
      const product = await Product.findById(productId);

      if (product) {
        product.quantity += orderedQuantity;
        await product.save();
      }
    }

      console.log(req.query.reason)
      order.reason = req.query.reason;
    
    order.status = "Return Successfull";
    await order.save();

    res.redirect(`/admin/orderDetails?orderId=${orderId}`);
  } catch (error) {
    console.log(error.message);
  }
};

// User side

const listUserOrders = async (req, res) => {
  try {
    const admin = req.session.adminData;
    const page = parseInt(req.query.page) || 1;
    let query = {};
    if (req.query.status) {
      if (req.query.status === "Pending") {
        query.status = 'Pending';
      } else if (req.query.status === "Shipped") {
        query.status = 'Shipped';
      }
      else if (req.query.status === "Out For Delivery") {
        query.status = 'Out For Delivery';
      }
      else if (req.query.status === "Order Confirmed") {
        query.status = 'Order Confirmed';
      }
      else if (req.query.status === "Out For Delivery") {
        query.status = 'Out For Delivery';
      }
      else if (req.query.status === "Delivered") {
        query.status = 'Delivered';
      }
      else if (req.query.status === "Return Requested") {
        query.status = 'Return Requested';
      }
      else if (req.query.status === "Return Successfull") {
        query.status = 'Return Successfull';
      }
      else if (req.query.status === "Cancelled") {
        query.status = 'Cancelled';
      }
    }
    const limit = 7;
    const totalCount = await Order.countDocuments(query);

    const totalPages = Math.ceil(totalCount / limit);

    const orders = await Order.find(query)
      .populate("user")
      .populate({
        path: "address",
        model: "Address",
      })
      .populate({
        path: "items.product",
        model: "Product",
      })
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ orderDate: -1 });
    res.render("ordersList", { orders, admin, totalPages, currentPage: page });
  } catch (error) {
    console.log(error.message);
  }
};

const orderCancel = async (req, res) => {
  try {
    const orderId = req.query.orderId;
    console.log(orderId)
    const reason = req.query.reason;
    console.log(reason)
    const order = await Order.findOne({ _id: orderId })
      .populate("user")
      .populate({
        path: "address",
        model: "Address",
      })
      .populate({
        path: "items.product",
        model: "Product",
      });

    for (const item of order.items) {
      const productId = item.product._id;
      const orderedQuantity = item.quantity;
      const product = await Product.findById(productId);

      if (product) {
        product.quantity += orderedQuantity;
        await product.save();
      }
    }

    order.reason = reason.toString()
    order.status = "Cancelled";
    await order.save();

    res.redirect(`/orderDetails?orderId=${orderId}`);
  } catch (error) {
    console.log(error.message);
  }
};

module.exports = {
  loadCheckout,
  postCheckout,
  loadOrderSuccess,
  loadOrderHistory,
  orderDetails,
  listUserOrders,
  orderCancel,
  adminOrderDetails,
  changeOrderStatus,
  returnOrder,
};
