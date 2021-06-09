const express = require('express');
const router = express.Router();
const Product = require('../models/Product')
const Category = require('../models/Category');
const { count } = require('../models/Product');
const auth = require('../middleware/auth');

// Get all products
router.get('/', async (req,res) =>{
    // Query params
    // localhost:3000/api/v1/products?categories= 23242324, 555
    let filter = {};

    if(req.query.categories) 
    {
        filter = {category: req.query.categories.split(',')}   
    }
    const productList = await Product.find(filter).populate('category')

    if(!productList){
        res.status(500).json({ success: false, message: 'ProductList not found'})
    }
    res.json(productList)
});

// Get only specific fields from product list i.e name or image...
// router.get('/', async (req,res) =>{
//     const productList = await Product.find({}).select('name image -_id')

//     if(!productList){
//         res.status(500).json({ success: false, message: 'ProductList not found'})
//     }
//     res.json(productList)
// });

// Get Product by ID
router.get('/:id', async (req,res) =>{
    const product = await Product.findById(req.params.id).populate('category')
    if(!product){
        res.status(500).json({ success: false, message: 'Product not found'})
    }
    res.json(product)
});

// Create a new product
router.post('/',auth, async (req,res) =>{
    const category = await Category.findById(req.body.category);
    if(!category) return res.status(400).send('Invalid category')
    try {
        const product = new Product({
            name: req.body.name,
            description: req.body.description,
            richDescription: req.body.richDescription,
            image: req.body.image,
            brand: req.body.brand,
            price: req.body.price,
            category: req.body.category,
            countInStock: req.body.countInStock,
            rating: req.body.rating,
            numReviews: req.body.numReviews,
            isFeatured: req.body.isFeatured
        })
    
        await product.save();

        if(!product) {
            return res.status(500).send({ msg: 'The product cannot be created'})
        }

        res.status(201).json(product);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

//update a product
router.put('/:id',auth,  async(req,res) => {
    const category = await Category.findById(req.body.category);
    if(!category) return res.status(400).send('Invalid category')

    const { name,
            description, 
            richDescription,
            image,
            brand,
            price,
            countInStock,
            rating,
            numReviews,
            isFeatured
        } = req.body;

    // Build updated Product Object
    const productFields = {};
    if(name) productFields.name = name;
    if(description) productFields.description = description;
    if(richDescription) productFields.richDescription = richDescription;
    if(image) productFields.image = image;
    if(brand) productFields.brand = brand;
    if(price) productFields.price = price;
    if(category) productFields.category = category;
    if(countInStock) productFields.countInStock = countInStock;
    if(rating) productFields.rating = rating;
    if(numReviews) productFields.numReviews = numReviews;
    if(isFeatured) productFields.isFeatured = isFeatured;
    try {
        let product  = await Product.findById(req.params.id);

        if(!product) return res.status(404).json({ msg: 'Product not found'});

        product = await Product.findByIdAndUpdate(req.params.id, { $set: productFields}, { new: true });
        res.json(product);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error')
    }
})

// Delete a product 
router.delete('/:id',auth, async (req,res) => {
    try {
        const product = await Product.findByIdAndRemove(req.params.id);

        if(!product) return res.status(404).json({ success: false, msg: 'Product not found'});

        res.status(200).json({ success: true, message: 'The product is deleted successfully'})
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

// mongoose methods to count the total number of products by creating own api endpoint
router.get('/get/count', async (req,res) =>{
    const productCount = await Product.countDocuments((count) => count)

    if(!productCount){
        res.status(500).json({ success: false, count: '0'})
    }
    res.send({productCount})
});

// To get featured products
router.get('/get/featured/:count', async (req,res) =>{
    const count = req.params.count? req.params.count: 0;

    const products = await Product.find({ isFeatured: true }).limit(+count)
    if(!products){
        res.status(500).json({ success: false, count: '0'})
    }
    res.send({products})
});

module.exports = router;
