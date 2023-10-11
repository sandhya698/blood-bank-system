const Users = require('../models/userModel');
const bcrypt = require('bcryptjs');

// register route
module.exports.register = async (req, res) => {
    // object destructuring
    const { name, email, phone, password, cpassword, userType } = req.body;

    // basic validation
    if (!name || !email || !phone || !password || !cpassword) {
        return res.status(422).json({ message: "Every field must be filled" });
    }
    else if (password !== cpassword) {
        return res.status(422).json({ message: "password and confirm password must be same" });
    }

    try {
        // Find a user by email if exists throw error
        const duplicateUser = await Users.findOne({ email });
        if (duplicateUser) {
            return res.status(406).json({ message: 'A user already exists with same email', error: duplicateUser });
        }

        const user = new Users({ name, email, phone, password, cpassword, userType });
        const registerdUser = await user.save();

        res.status(201).json({ message: 'User registered', data: registerdUser });
    }
    catch (err) {
        if (err.name === "MongoError" || err.name === "MongoServerError") {
            // MongoDB-related error
            console.log("MongoDB Error:", err.message);
            res.status(422).json({
                message: 'Error occured while registering',
                error: err.message
            });
        } else {
            // Other types of errors
            console.log("Generic Error:", err);
            res.status(422).json({
                message: 'unknown error',
                error: err
            });
        }
    }
}

// login route
module.exports.login = async (req, res) => {
    // object destructuring
    const { email, password } = req.body;

    // validation
    if (!email || !password ) {
        return res.status(422).json({ message: "email and password are required" });
    }

    try {
        const loginUser = await Users.findOne({ email });
        if (loginUser) {
            // comparing user password with hashed password
            // returns true if both hash values are matched
            const hashOk = await bcrypt.compare(password, loginUser.password);

            if (!hashOk) {
                return res.status(401).json({ message: "Invalid Credentials." });
            }

            res.status(200).json({ message: "Login success" });
        }
        else {
            return res.status(401).json({ message: "Invalid Credentials." });
        }

    }
    catch (err) {
        res.status(422).json({
            message: 'unknown error',
            error: err.message
        });
    }
}