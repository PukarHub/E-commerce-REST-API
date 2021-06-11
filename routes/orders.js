const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const OrderItem = require('../models/Order-Item');
const auth = require('../middleware/auth');

// Get all Order List
router.get('/',auth, async(req,res) => {
    try {
        const orderList = await Order.find({}).populate('user', 'name').sort({'dateOrdered': -1});
        res.json(orderList);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Get single order by id  
  router.get('/:id',auth, async(req,res) => {
    try {
        const order = await Order.findById(req.params.id)
            .populate('user', 'name')
            .populate({ 
                    path: 'orderItems', populate: 
                            { path: 'product', populate: 'category'}
                });

        res.json(order);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});  

// Create a order
router.post('/',auth, async (req,res) => {
    // Entering into the order items array and selecting each order id to be displayed in order
    const orderItemsIds =  Promise.all(req.body.orderItems.map(async orderItem => {
        let newOrderItem = new OrderItem({
            quantity: orderItem.quantity, 
            product: orderItem.product
        });

        newOrderItem = await newOrderItem.save();

        return newOrderItem._id;    
    }));

    // for handling the second promise
    const orderItemsIdsResolved = await orderItemsIds;
    console.log(orderItemsIdsResolved); 

    // Calulation total price of Ordered Items by multiplying between quantity and product price.
    const totalPrices = await Promise.all(orderItemsIdsResolved.map(async (orderItemId) => {
       const orderItem = await OrderItem.findById(orderItemId).populate('product', 'price');
       const totalPrice = orderItem.product.price * orderItem.quantity;
       return totalPrice;
    }));

    const totalPrice = totalPrices.reduce((a,b) => a+b, 0);
    console.log(totalPrices);

    try {
        let order = new Order({
            orderItems: orderItemsIdsResolved,
            shippingAddress1: req.body.shippingAddress1,
            shippingAddress2: req.body.shippingAddress2,
            city: req.body.city, 
            zip: req.body.zip,
            phone: req.body.phone,
            country: req.body.country,
            status: req.body.status,
            totalPrice:  totalPrice,
            user: req.body.user,
        })

        await order.save();

        if(!order)
        return res.status(400).send('the order cannot be created!');

        res.status(201).json(order);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});   

// update an order
router.put('/:id',auth,  async(req,res) => {
    const {status} = req.body;

    // Build Contact Object
    const orderFields = {};
    if(status) orderFields.status = status;

    try {
        let order  = await Order.findById(req.params.id);

        if(!order) return res.status(404).json({ msg: 'Order not found'});

        order = await Order.findByIdAndUpdate(req.params.id, { $set: orderFields}, { new: true });
        res.json(order);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error')
    }
});

// Delete an order 
router.delete('/:id',auth, async (req,res) => {
        Order.findByIdAndRemove(req.params.id).then(async order => {
            if(order) {
                await order.orderItems.map(async orderItem => {
                    await OrderItem.findByIdAndRemove(orderItem)
                })
                return res.status(200).json({success: true, message: 'The order was successfully removed'})
            } else {
                return res.status(404).json({success: false, message: 'The order not found'})   
            }
        }).catch(err => {
        console.error(err.message);
        res.status(500).send('Server Error');
    });
});

// Get total number of slaes in our ecommerce application
router.get('/get/totalsales', async (req, res) => {
    const totalSales = await Order.aggregate([
        { $group: { _id:null, totalSales : { $sum: '$totalPrice' }}}
    ]);

    if(!totalSales) {
        return res.status(400).send('The order sales cannot be generated');
    }

    res.send({totalSales: totalSales.pop().totalSales});
});

// mongoose methods to count the total number of orders
router.get('/get/count', async (req,res) =>{
    const orderCount = await Order.countDocuments((count) => count)

    if(!orderCount){
        res.status(500).json({ success: false, count: '0'})
    }
    res.send({orderCount})
});

// Orders History
router.get('/get/userorders/:userid', async(req,res) => {
    try {
        const userOrderList = await Order.find({user: req.params.userid})
        .populate({ 
                path: 'orderItems', populate: 
                        { path: 'product', populate: 'category'}
        })
        .sort({'dateOrdered': -1});
        res.json(userOrderList);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;