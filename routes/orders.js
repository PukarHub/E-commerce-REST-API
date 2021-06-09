const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Get all Order List
router.get('/', async(req,res) => {
    try {
        const orderList = await Order.find({});
        res.json(orderList);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
  });

module.exports = router;