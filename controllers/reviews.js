const Campground = require('../models/campground');  // Ensure the model is correctly defined
const Review = require('../models/review'); 

module.exports.createReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate('reviews');
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Created new review!');
    res.redirect(`/campgrounds/${campground._id}`); // Redirect to the campground details page
}

module.exports.deleteReview = async(req,res) => {
    const{id, reviewId} = req.params;
   await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    req.flash('success', 'Successully deleted review!');
    res.redirect(`/campgrounds/${id}`);
}