const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({secret:"fingerprint_customer",resave: true, saveUninitialized: true}))

app.use("/customer/auth/*", function auth(req, res, next) {
    // Check if session exists and has authorization
    if (!req.session || !req.session.authorization) {
        return res.status(401).json({ message: "Please login to access this resource" });
    }

    // Check if access token exists
    const token = req.session.authorization['accessToken'];
    if (!token) {
        return res.status(401).json({ message: "No access token found" });
    }

    try {
        // Verify the JWT token
        const decoded = jwt.verify(token, "fingerprint_customer");
        
        // Check if token is expired
        if (decoded.exp && Date.now() >= decoded.exp * 1000) {
            return res.status(401).json({ message: "Token has expired" });
        }

        // Attach user to request object
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token has expired" });
        }
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Invalid token" });
        }
        return res.status(500).json({ message: "Internal server error during authentication" });
    }
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);

app.listen(PORT,()=>console.log("Server is running"));
