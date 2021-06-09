const express = require('express');
const router = express.Router();
const Category = require('../models/Category');
const auth = require('../middleware/auth');

// Get all Category List
router.get('/', async(req,res) => {
    try {
        const categoryList = await Category.find({});
        res.json(categoryList);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
  });

// Get category by Id
router.get('/:id', async (req,res) => {
    try {
        const category = await Category.findById(req.params.id);

        if(!category) return res.status(404).json({ success: false, msg: 'Category not found'});

        res.status(200).json(category);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})  

//create a new category
router.post('/',auth, async (req,res) => {
    try {
        let category = new Category({
            name: req.body.name,
            color: req.body.color,
            icon: req.body.icon
        })

        await category.save()
        res.status(201).json(category);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})  

// Update a category
router.put('/:id',auth,  async(req,res) => {
    const {name, color, icon} = req.body;

    // Build Contact Object
    const categoryFields = {};
    if(name) categoryFields.name = name;
    if(color) categoryFields.color = color;
    if(icon) categoryFields.icon = icon;
    try {
        let category  = await Category.findById(req.params.id);

        if(!category) return res.status(404).json({ msg: 'Category not found'});

        category = await Category.findByIdAndUpdate(req.params.id, { $set: categoryFields}, { new: true });
        res.json(category);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error')
    }
})

// Delete a category  /api/v1/categories/:id
router.delete('/:id',auth, async (req,res) => {
    try {
        const category = await Category.findByIdAndRemove(req.params.id);

        if(!category) return res.status(404).json({ success: false, msg: 'Category not found'});

        res.status(200).json({ success: true, message: 'The category is deleted successfully'})
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})

module.exports = router;