const User = require('../models/userModel');
const Product = require('../models/productModel');
const Review= require('../models/reviewModel')

//Function to post a review
const postReview = async (req, res) => {
  const reviewText = req.body.commentDescription;
  const productId = req.query.productId;
  const rating = req.body.star;
  const userId = req.session.userData._id;
  const title = req.body.commentTitle;
  try {
    const existingReview = await Review.findOne({
      productId: productId,
      userId: userId,
    });

  
    if (existingReview) {
      const oldRating = existingReview.starRating; 

     
      if (rating) {
        existingReview.starRating = rating;
      }
      if (reviewText) {
        existingReview.description = reviewText;
      }
      if (title) {
        existingReview.title = title;
      }
      existingReview.date = Date.now();

      await existingReview.save();

      const product = await Product.findOne({ _id: productId });
      if (product) {
     
        const index = product.ratings.indexOf(oldRating);
        if (index !== -1) {
          product.ratings.splice(index, 1);
        }

     
        product.ratings.push(rating);
        await product.save();
      }
    } else if (rating && reviewText && title) {
      const review = new Review({
        productId: productId,
        userId: userId,
        starRating: rating,
        description: reviewText,
        title: title,
        date: Date.now(),
      });
      await review.save();

      const product = await Product.findOne({ _id: productId });
      if (product) {
        product.ratings.push(rating);
        await product.save();
      }
    }
    res.redirect(`/productView?id=${productId}`);
  } catch (err) {
    console.log("Error occurred while posting review: ", err);
  }
};

//function to get all the reviews done by a user  
const viewrating = async (req, res) => {
    try {
      const user = req.session.user;
    
      const userReviews = await Review.find({userId : user._id}).populate('productId'); 
     
 
  
      res.render('/viewRatingReview', { userReviews, user});
    } catch (error) {
      console.log("error fetching details ", error);
    }
  };


//delete a particular review done by the user
const deleteReview = async (req, res) => {
  try {
    const reviewId = req.query.reviewId;
    const deletedReview = await Review.findByIdAndDelete(reviewId);
    const productId = deletedReview.productId;   
    const product = await Product.findOne({ _id: productId });
   
    if (product) {
 
      const index = product.ratings.indexOf(deletedReview.starRating);
      if (index !== -1) {
        product.ratings.splice(index, 1);
        await product.save();
      }
    }

    res.redirect('/admin/productReviews');
  } catch (err) {
    console.log("Error occurred while deleting review", err);
  }
};




//function to get all the reviews done for a product by the user in the admin side
const loadProductReviews = async (req, res) => {
  try {
    const admin = req.session.adminData;
    const page = parseInt(req.query.page) || 1;
    const perPage =7;

    const totalReviews = await Review.countDocuments();
    const totalPages = Math.ceil(totalReviews / perPage);

    const userReviews = await Review.find()
      .populate('productId')
      .populate('userId')
      .skip((page - 1) * perPage)
      .limit(perPage);

    res.render('loadProductReviews', { userReviews, admin, totalPages, currentPage: page });
  } catch (error) {
    console.log("Error fetching review details:", error);
    // Handle the error
    res.status(500).json({ error: 'Internal Server Error' });
  }
};





module.exports = {
    postReview,
    viewrating,
    deleteReview,
    loadProductReviews,

    }




    


  
