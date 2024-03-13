const Errorhandler = require('../utils/errorHandler');
const Product = require('../models/productModel');
const catchAsyncerror = require('../middleware/catchAsyncerror');
const ApiFeatures = require('../routes/apiFeatures');
const cloudinary = require('cloudinary');

// create product 
exports.createProduct = catchAsyncerror(async (req, res, next) => {

    let images = [];

    if (typeof (req.body.images) === 'string') {
        images.push(req.body.images);
    } else {
        images = req.body.images;
    }

    const imageLinks = [];

    for (let i = 0; i < images.length; i++) {
        const result = await cloudinary.v2.uploader.upload(images[i], {
            folder: "Product"
        })
        imageLinks.push({
            public_id: result.public_id,
            url: result.secure_url
        })
    }


    req.body.images = imageLinks;
    req.body.user = req.user.id;

    const product = await Product(req.body).save();

    res.status(201).json({
        success: true,
        product
    })

});

// get all product
exports.getAllproduct = catchAsyncerror(async (req, res, next) => {
    const resultpage = 8;
    const productCount = await Product.countDocuments();
    const apiFeatures = new ApiFeatures(Product.find(), req.query)
        .search()
        .filter()


    const filterProductCount = productCount;

    apiFeatures.pagination(resultpage);

    let products = await apiFeatures.query;

    res.status(200).json({
        success: true,
        products,
        productCount,
        resultpage,
        filterProductCount
    });
});

// get all product (ADMIN)
exports.getAdminProducts = catchAsyncerror(async (req, res, next) => {

    const products = await Product.find();

    res.status(200).json({
        success: true,
        products
    });
});

// update product
exports.updateProduct = catchAsyncerror(async (req, res, next) => {
    let products = await Product.findById(req.params.id);
    if (!products) {
        return next(new Errorhandler("product not found", 404));
    }

    let images = []

    if (typeof req.body.images === 'string') {
        images.push(req.body.images);
    } else {
        images = req.body.images;
    }

    if (images !== undefined) {
        for (let i = 0; i < products.images.length; i++) {
            const result = await cloudinary.v2.uploader.destroy(products.images[i].public_id);

        }
    }

    let imagesLinks=[];

    for(let i=0;i<images.length;i++){
        const result=await cloudinary.v2.uploader.upload(images[i],{
            folder:"Product"
        });

        imagesLinks.push({
            public_id:result.public_id,
            url:result.secure_url
        });
    }

    req.body.images=imagesLinks;

    products = await Product.findByIdAndUpdate(req.params.id, req.body, {
        new: true
    })

    res.status(200).json({
        success: true,
        products
    })
})

// product delete
exports.deleteProduct = catchAsyncerror(async (req, res) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new Errorhandler("product not found", 404));
    }

    // delete Cloudinary images 
    for (let i = 0; i < product.images.length; i++) {
        const result = await cloudinary.v2.uploader.destroy(product.images[i].public_id);
    }

    await Product.findOneAndDelete(req.params.id)
    res.status(200).json({
        success: true,
        message: 'product delete'
    })
})

// get product details
exports.getproductDetails = catchAsyncerror(async (req, res, next) => {
    let product = await Product.findById(req.params.id);

    if (!product) {
        return next(new Errorhandler("product not found", 404));
    }

    res.status(200).json({
        success: true,
        product
    })
})


// create user review 
exports.createProductReview = catchAsyncerror(async (req, res, next) => {

    const { rating, comment, productId } = req.body;
    const review = {
        user: req.user._id,
        name: req.user.name,
        rating: Number(rating),
        comment
    }
    const product = await Product.findById(productId);

    // console.log(product);

    const isReviewed = product.reviews.find(
        (rev) => rev.user.toString() === req.user._id.toString()
    );


    if (isReviewed) {
        // console.log("i m here");
        product.reviews.forEach((rev) => {
            if (rev.user.toString() === req.user._id.toString()) {
                (rev.rating = rating),
                    (rev.comment = comment)
            }
        });
    } else {
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }

    let avg = 0;
    product.ratings = product.reviews.forEach((rev) => {
        avg += rev.rating
    });

    product.ratings = avg / product.reviews.length;

    await product.save({ validateBeforeSave: false });

    res.status(200).json({
        success: true
    })
})


exports.getAllReviews = catchAsyncerror(async (req, res, next) => {

    const product = await Product.findById(req.query.id);

    if (!product) {
        return next(new Errorhandler("product not found", 404));
    }

    res.status(200).json({
        success: true,
        reviews: product.reviews
    })
})

exports.deleteProductReviews = catchAsyncerror(async (req, res, next) => {

    const product = await Product.findById(req.query.productId);

    if (!product) {
        return next(new Errorhandler("product not found", 404));
    }

    const reviews = product.reviews.filter((rev) => rev._id.toString() !== req.query.id.toString());

    let avg = 0;
    reviews.forEach((rev) => {
        avg += rev.rating
    });
   
    let ratings=0;
    
    if(reviews.length===0){
        ratings=0;
    }else{
        ratings = avg / reviews.length;
    }

    const numOfReviews = reviews.length;

    await Product.findByIdAndUpdate(req.query.productId, {
        reviews, ratings, numOfReviews
    }, {
        new: true,
        runValidators: true,
        usefindAndModify: false
    })

    res.status(200).json({
        success: true,
    })
})