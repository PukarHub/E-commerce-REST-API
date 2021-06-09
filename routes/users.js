const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const auth = require('../middleware/auth');

// Get all user List
router.get('/',auth, async(req,res) => {
    try {
        const userList = await User.find({}).select('-passwordHash');

        if(!userList){
            res.status(500).json({ success: false, message: 'UserList not found'})
        }

        res.json(userList);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
  });

// Get single user
router.get('/:id',auth, async (req,res) => {
    try {
        const user = await User.findById(req.params.id).select('-passwordHash');

        if(!user) return res.status(404).json({ success: false, msg: 'user not found'});

        res.status(200).json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})  

// Create a new user by Admin
router.post('/',auth, async (req,res) =>{
    const {name,email,passwordHash, street, apartment,city,zip,country,phone,isAdmin} = req.body;

    try {
        let user = await User.findOne({ email })

        if(user) {
            res.status(400).json({ msg: 'User Already Exist' });
        }
        user = new User({
            name,
            email,
            passwordHash,
            street,
            apartment,
            city,
            zip,
            country,
            phone,
            isAdmin,
        })
        
         //Hash Password Before Save to DB
        const salt = await bcrypt.genSaltSync(10);

        user.passwordHash = await bcrypt.hash(passwordHash, salt)
        await user.save();

        if(!user) {
            return res.status(500).send({ msg: 'The User cannot be created'})
        }

        res.status(201).json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// Auth user and Get Token
router.post('/login',
    [
    body('email', 'Please include a valid email').isEmail(),
    body('password', 'Password is required').exists()
    ],
    async (req,res) => {

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    const {email, password} = req.body
    const secret = process.env.SECRET;

    try {
        let user = await User.findOne({ email})
        
        if(!user){
            res.status(400).json({ msg: 'The user not found'});
        }

        // Hashing the password with bcrypt js
        const isMatch = await bcrypt.compare(password, user.passwordHash)
    
        if(!isMatch){
            res.status(400).json({ msg: 'Invalid Credentials'});
        } 

        // Configuring with Json Web Token
        const payload = {
            user: {
                id: user.id,
                isAdmin: user.isAdmin,
            }
        }

        jwt.sign(payload, secret, {expiresIn: '1d'}, (err, token) => {
            if(err) throw err;
            res.json({ user: user.email, token });
        })
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error')
    }

})

// Register a new user
router.post('/register', async (req,res) =>{
    const {name,email,passwordHash, street, apartment,city,zip,country,phone,isAdmin} = req.body;

    try {
        let user = await User.findOne({ email })

        if(user) {
            res.status(400).json({ msg: 'User Already Exist' });
        }
        user = new User({
            name,
            email,
            passwordHash,
            street,
            apartment,
            city,
            zip,
            country,
            phone,
            isAdmin,
        })
        
         //Hash Password Before Save to DB
        const salt = await bcrypt.genSaltSync(10);

        user.passwordHash = await bcrypt.hash(passwordHash, salt)
        await user.save();

        if(!user) {
            return res.status(500).send({ msg: 'The User cannot be created'})
        }

        res.status(201).json(user);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// mongoose methods to count the total number of products by creating own api endpoint
router.get('/get/count', async (req,res) => {
    const userCount = await User.countDocuments((count) => count);

    if(!userCount) {
        res.status(500).json({ success: false, count: '0'})
    }
    res.send({userCount})
})

// To get Registered users
router.get('/get/registered/:count', async(req,res) => {
    const count = req.params.count ? req.params.count: 0;

    const users = await User.find({}).limit(+count);
    if(!users){
        res.status(500).json({ success: false, count: '0'})
    }
    res.send({users})
})

// Update a user
router.put('/:id', auth, async(req,res) => {
    const userExist = await User.findById(req.params.id);
    let newPassword 
    if(req.body.password) {
        const salt = await bcrypt.genSaltSync(10);  
        newPassword = await bcrypt.hash(req.body.password, salt)
    } else {
        newPassword = userExist.passwordHash
    }
    const {name, email,passwordHash, street,apartment,city,zip,country,phone, isAdmin} = req.body;

    // Build Contact Object
    const userFields = {};
    if(name) userFields.name = name;
    if(email) userFields.email = email;
    if(passwordHash) userFields.passwordHash = newPassword;
    if(street) userFields.street = street;
    if(apartment) userFields.apartment = apartment;
    if(city) userFields.city = city;
    if(zip) userFields.zip = zip;
    if(country) userFields.country = country;
    if(phone) userFields.phone = phone;
    if(isAdmin) userFields.isAdmin = isAdmin;

    try {

        if(!userExist) return res.status(404).json({ msg: 'User not found'});

        user = await User.findByIdAndUpdate(req.params.id, { $set: userFields}, { new: true });
        res.json(user);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error')
    }
})

//Delete a user
router.delete('/:id',auth, async (req,res) => {
    try {
        const user = await User.findByIdAndRemove(req.params.id);

        if(!user) return res.status(404).json({ success: false, msg: 'User not found'});

        res.status(200).json({ success: true, message: 'The user is deleted successfully'})
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
})


module.exports = router;