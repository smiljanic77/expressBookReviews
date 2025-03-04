const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const jwt = require('jsonwebtoken');
const axios = require('axios');

// Register a new user
public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({message: "Username and password are required"});
    }

    if (users.find(user => user.username === username)) {
        return res.status(400).json({message: "Username already exists"});
    }

    users.push({username: username, password: password});
    return res.status(200).json({message: "User successfully registered"});
});

// Get the book list available in the shop using async/await
public_users.get('/', async function (req, res) {
    try {
        // Simulating an async operation with a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        return res.status(200).json(JSON.stringify(books, null, 2));
    } catch (error) {
        return res.status(500).json({message: "Error fetching books", error: error.message});
    }
});

// Get book details based on ISBN using async/await
public_users.get('/isbn/:isbn', async function (req, res) {
    try {
        const isbn = req.params.isbn;
        await new Promise(resolve => setTimeout(resolve, 1000));
        const book = books[isbn];
        
        if (!book) {
            return res.status(404).json({message: "Book not found"});
        }
        
        return res.status(200).json(JSON.stringify(book, null, 2));
    } catch (error) {
        return res.status(500).json({message: "Error fetching book details", error: error.message});
    }
});
  
// Get book details based on author using async/await
public_users.get('/author/:author', async function (req, res) {
    try {
        const author = req.params.author;
        await new Promise(resolve => setTimeout(resolve, 1000));
        const booksByAuthor = Object.values(books).filter(book => book.author === author);
        
        if (booksByAuthor.length === 0) {
            return res.status(404).json({message: "No books found by this author"});
        }
        
        return res.status(200).json(JSON.stringify(booksByAuthor, null, 2));
    } catch (error) {
        return res.status(500).json({message: "Error fetching books by author", error: error.message});
    }
});

// Get all books based on title using async/await
public_users.get('/title/:title', async function (req, res) {
    try {
        const title = req.params.title;
        await new Promise(resolve => setTimeout(resolve, 1000));
        const booksByTitle = Object.values(books).filter(book => book.title === title);
        
        if (booksByTitle.length === 0) {
            return res.status(404).json({message: "No books found with this title"});
        }
        
        return res.status(200).json(JSON.stringify(booksByTitle, null, 2));
    } catch (error) {
        return res.status(500).json({message: "Error fetching books by title", error: error.message});
    }
});

// Get book review
public_users.get('/review/:isbn',function (req, res) {
    const isbn = req.params.isbn;
    const book = books[isbn];
    
    if (!book) {
        return res.status(404).json({message: "Book not found"});
    }
    
    return res.status(200).json(JSON.stringify(book.reviews, null, 2));
});

const isValid = (username) => {
    return users.some(user => user.username === username);
}

const authenticatedUser = (username, password) => {
    const user = users.find(user => user.username === username);
    return user && user.password === password;
}

// Login route
public_users.post("/login", (req, res) => {
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

public_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.user.data;

    if (!books[isbn]) {
        return res.status(404).json({message: "Book not found"});
    }

    if (!review) {
        return res.status(400).json({message: "Review is required"});
    }

    if (!books[isbn].reviews) {
        books[isbn].reviews = {};
    }

    books[isbn].reviews[username] = review;

    return res.status(200).json({message: "Review added/updated successfully"});
});

public_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const username = req.user.data;

    if (!books[isbn]) {
        return res.status(404).json({message: "Book not found"});
    }

    if (!books[isbn].reviews || !books[isbn].reviews[username]) {
        return res.status(404).json({message: "Review not found"});
    }

    delete books[isbn].reviews[username];

    return res.status(200).json({message: "Review deleted successfully"});
});

module.exports.general = public_users;
