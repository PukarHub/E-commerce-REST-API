const mongoose = require('mongoose');

const OrderSchema = new mongoose.Schema({
    orderItems: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'OrderItem',
        required: true
    }],
    shippingAddress1: {
        type: String,
        required: true
    },
    shippingAddress2: {
        type: String
    },
    city: {
        type: String,
        requird: true
    },
    zip: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true,
    },
    phone: {
        type: String,
        required: true
    },
    status: {
        type: String,
        required: true,
        default: 'Pending'
    },
    totalPrice:{
        type: Number
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    dateOrdered: {
        type: Date,
        default: Date.now,
    }
});

OrderSchema.virtual('id').get(function() {
    return this._id.toHexString();
})

OrderSchema.set('toJSON', {
    virtuals: true
})


module.exports  = mongoose.model('Order', OrderSchema); 


/*
Order Example: Sample of how DB is created  for orders

{
    "orderItems": [
        {
            "quantity": 3,
            "product": "54n3nm5b3nm5b34mn"
        },
        {
            "quantity": 2,
            "product": "n4nm43m345n3mb34mn"
        },
    ],
    "shippingAddress1": "Jhapa Nepal",
    "shippingAddress2": "22-c",
    "city": "Birtamod",
    "zip": "0000",
    "country": "nepal",
    "phone": "5345435",
    "user": "3nm2nm4324nm32"
}

*/