const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    return users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => {
    const user = users.find(user => user.username === username);
    return user && user.password === password;
}

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({message: "Username and password are required"});
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({message: "Invalid username or password"});
    }

    let accessToken = jwt.sign({
        data: username
    }, 'fingerprint_customer', { expiresIn: 60 * 60 });

    req.session.authorization = {
        accessToken
    };

    return res.status(200).json({message: "User successfully logged in"});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.user.data;

    if (!books[isbn]) {
        return res.status(404).json({message: "Book not found"});
    }

    if (!review) {
        return res.status(400).json({message: "Review is required"});
    }

    // Initialize reviews object if it doesn't exist
    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    // Add or update the review
    books[isbn].reviews[username] = review;

    return res.status(200).json({message: "Review added/updated successfully"});
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user.data;

    if (!books[isbn]) {
        return res.status(404).json({message: "Book not found"});
    }

    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(404).json({message: "Review not found"});
    }

    // Delete the review
    delete books[isbn].reviews[username];

    return res.status(200).json({message: "Review deleted successfully"});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
