const Product = require('../models/productModel')
const catchAsyncErros = require("../middleware/catchAsyncError");
const ErrorHander = require('../utils/errorhander');
const ApiFeatures = require('../utils/apifeatures');

//create product

exports.createProduct =catchAsyncErros(
    async(req,res,next)=>{
        req.body.user = req.user.id;
        
        const product = await Product.create(req.body)
        res.status(201).json({
             success:true,
             product
        
            })
    }
);

////get All Product
exports.getAllProducts = catchAsyncErros(async(req,res)=>{

    const resultPerPage = 8;
    const productCount = await Product.countDocuments();
    const apiFeature = new ApiFeatures(Product.find(), req.query)
        .serach()
        .filter();

    let products = await apiFeature.query;

    let filteredProductsCount = products.length;

    apiFeature.pagination(resultPerPage);

    products = await apiFeature.query.clone();

    res.status(200).json({
        success:true,
        products,
        productCount,
        resultPerPage,
        filteredProductsCount
        
    
    })
});

//update product

exports.updateProduct = catchAsyncErros(async(req,res)=>{
    let product = await Product.findById(req.params.id)

    if(!product){
        return next(new ErrorHander('Product not found',404))
    }

    product = await Product.findByIdAndUpdate(req.params.id,req.body,{
        new:true,
        runValidators:true,
        useFindAndModify:false
    })

    res.status(200).json({
        success:true,
        product
    
    })
});

// delete product

exports.deleteProduct = catchAsyncErros(async(req,res,next)=>{
    let product = await Product.findById(req.params.id)

    if(!product){
        return next(new ErrorHander('Product not found',404))
    }

    await product.remove();

    res.status(200).json({
        success:true,
        messgae:"product deleted successfully"
    
    })
});

// getProductDetails 

exports.getProductDetails = catchAsyncErros(async(req,res,next)=>{
    let product = await Product.findById(req.params.id)

    if(!product){
       

        return next(new ErrorHander('Product not found',404))
    }

    res.status(200).json({
        success:true,
        product
    
    })

});

//Create new review our update the review
exports.createProductReview = catchAsyncErros(async(req,res,next)=>{

    const {rating,comment,productId} = req.body;
    const review = {
        user:req.user._id,
        name:req.user.name,
        rating: Number(rating),
        comment
    };

    let product = await Product.findById(productId);

    const isReviewed = product.reviews.find((rev) => rev.user.toString()===req.user._id.toString());
    if(isReviewed){
        product.reviews.forEach(rev => {
            if(rev.user.toString()===req.user._id.toString()){
                rev.rating = Number(rating),
                rev.comment = comment
            }
        });
    }else{
        product.reviews.push(review);
        product.numOfReviews = product.reviews.length;
    }

    let avg = 0;

    product.reviews.forEach(rev => {
        avg+=rev.rating;
    })

    product.ratings = avg/product.reviews.length;

    await product.save({ validateBeforeSave:false });
    res.status(200).json({
        success:true,
        messgae:"product review successfully added"
    
    })

});

//Get all reviews of a product 

exports.getProductReviews = catchAsyncErros(async(req,res,next)=>{
    let product = await Product.findById(req.query.id);
    if(!product){     
        return next(new ErrorHander('Product not found',404))
    }
    res.status(200).json({
        success:true,
        reviews:product.reviews
    
    })
});

//Delete product review
exports.deleteReview = catchAsyncErros(async(req,res,next)=>{
    let product = await Product.findById(req.query.productId);
    if(!product){     
        return next(new ErrorHander('Product not found',404))
    }

    let reviews = product.reviews.filter( rev => rev._id.toString() !== req.query.id.toString()  );

    let avg = 0;

    reviews.forEach(rev => {
        avg+=rev.rating;
    })

    const ratings = avg/reviews.length;

    const numOfReviews = reviews.length;
    await Product.findByIdAndUpdate(req.query.productId,{
        reviews,
        ratings,
        numOfReviews
    },{
        new:true,
        runValidators:true,
        useFindAndModify:false
    });
    res.status(200).json({
        success:true,
    
    })
});

