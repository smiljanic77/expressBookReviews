const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const jwt = require('jsonwebtoken');
const axios = require('axios');

// Register a new user
public_users.post("/register", async function (req, res) {
    try {
        console.log("Registration request received");
        console.log("Request headers:", req.headers);
        console.log("Request body:", req.body);
        console.log("Content-Type:", req.get('Content-Type'));
        
        // Check if request body exists and is not empty
        if (!req.body || Object.keys(req.body).length === 0) {
            console.log("No request body received or empty body");
            return res.status(400).json({
                message: "Registration failed",
                error: "Request body is required",
                receivedBody: req.body
            });
        }

        // Check if Content-Type is application/json
        const contentType = req.get('Content-Type');
        if (!contentType || !contentType.includes('application/json')) {
            console.log("Invalid Content-Type:", contentType);
            return res.status(400).json({
                message: "Registration failed",
                error: "Content-Type must be application/json",
                receivedContentType: contentType
            });
        }

        const username = req.body.username;
        const password = req.body.password;

        console.log("Username:", username);
        console.log("Password:", password);

        // Validate username and password
        if (!username || !password) {
            console.log("Validation failed: Missing username or password");
            return res.status(400).json({
                message: "Registration failed",
                error: "Username and password are required",
                receivedBody: req.body
            });
        }

        // Validate username format (alphanumeric, 3-20 characters)
        if (!/^[a-zA-Z0-9]{3,20}$/.test(username)) {
            return res.status(400).json({
                message: "Registration failed",
                error: "Username must be 3-20 characters long and contain only letters and numbers"
            });
        }

        // Validate password strength (at least 6 characters)
        if (password.length < 6) {
            return res.status(400).json({
                message: "Registration failed",
                error: "Password must be at least 6 characters long"
            });
        }

        // Check if username already exists
        if (users.find(user => user.username === username)) {
            return res.status(409).json({
                message: "Registration failed",
                error: "Username already exists"
            });
        }

        // Simulating an async operation with a delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Add new user
        users.push({
            username: username,
            password: password
        });

        return res.status(201).json({
            message: "User successfully registered",
            username: username
        });
    } catch (error) {
        console.error("Error during registration:", error);
        return res.status(500).json({
            message: "Registration failed",
            error: "Internal server error"
        });
    }
});

// Get the book list available in the shop using async/await
public_users.get('/', async function (req, res) {
    try {
        // Check if books object exists and is not empty
        if (!books || Object.keys(books).length === 0) {
            return res.status(404).json({message: "No books available in the shop"});
        }

        // Simulating an async operation with a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Return the books with proper formatting
        return res.status(200).json({
            message: "Books retrieved successfully",
            count: Object.keys(books).length,
            books: books
        });
    } catch (error) {
        console.error("Error fetching books:", error);
        return res.status(500).json({
            message: "Error fetching books",
            error: error.message
        });
    }
});

// Get book details based on ISBN using async/await
public_users.get('/isbn/:isbn', async function (req, res) {
    try {
        const isbn = req.params.isbn;
        
        // Validate ISBN format (assuming it's a number)
        if (!isbn || isNaN(isbn)) {
            return res.status(400).json({message: "Invalid ISBN format"});
        }

        // Simulating an async operation with a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const book = books[isbn];
        
        if (!book) {
            return res.status(404).json({message: "Book not found"});
        }
        
        // Return the book with proper formatting
        return res.status(200).json({
            message: "Book retrieved successfully",
            isbn: isbn,
            book: book
        });
    } catch (error) {
        console.error("Error fetching book details:", error);
        return res.status(500).json({
            message: "Error fetching book details",
            error: error.message
        });
    }
});
  
// Get book details based on author using async/await
public_users.get('/author/:author', async function (req, res) {
    try {
        const author = req.params.author;
        
        // Validate author parameter
        if (!author || typeof author !== 'string') {
            return res.status(400).json({message: "Invalid author parameter"});
        }

        // Simulating an async operation with a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get all books and filter by author
        const booksByAuthor = Object.entries(books)
            .filter(([isbn, book]) => book.author.toLowerCase() === author.toLowerCase())
            .map(([isbn, book]) => ({
                isbn: isbn,
                ...book
            }));
        
        if (booksByAuthor.length === 0) {
            return res.status(404).json({message: "No books found by this author"});
        }
        
        // Return the books with proper formatting
        return res.status(200).json({
            message: "Books retrieved successfully",
            count: booksByAuthor.length,
            books: booksByAuthor
        });
    } catch (error) {
        console.error("Error fetching books by author:", error);
        return res.status(500).json({
            message: "Error fetching books by author",
            error: error.message
        });
    }
});

// Get all books based on title using async/await
public_users.get('/title/:title', async function (req, res) {
    try {
        const title = req.params.title;
        
        // Validate title parameter
        if (!title || typeof title !== 'string') {
            return res.status(400).json({message: "Invalid title parameter"});
        }

        // Simulating an async operation with a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Get all books and filter by title
        const booksByTitle = Object.entries(books)
            .filter(([isbn, book]) => book.title.toLowerCase() === title.toLowerCase())
            .map(([isbn, book]) => ({
                isbn: isbn,
                ...book
            }));
        
        if (booksByTitle.length === 0) {
            return res.status(404).json({message: "No books found with this title"});
        }
        
        // Return the books with proper formatting
        return res.status(200).json({
            message: "Books retrieved successfully",
            count: booksByTitle.length,
            books: booksByTitle
        });
    } catch (error) {
        console.error("Error fetching books by title:", error);
        return res.status(500).json({
            message: "Error fetching books by title",
            error: error.message
        });
    }
});

// Get book review
public_users.get('/review/:isbn', async function (req, res) {
    try {
        const isbn = req.params.isbn;
        
        // Validate ISBN format (assuming it's a number)
        if (!isbn || isNaN(isbn)) {
            return res.status(400).json({message: "Invalid ISBN format"});
        }

        // Simulating an async operation with a delay
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const book = books[isbn];
        
        if (!book) {
            return res.status(404).json({message: "Book not found"});
        }

        // Check if book has any reviews
        if (!book.reviews || Object.keys(book.reviews).length === 0) {
            return res.status(200).json({
                message: "No reviews found for this book",
                isbn: isbn,
                reviews: {}
            });
        }
        
        // Return the reviews with proper formatting
        return res.status(200).json({
            message: "Reviews retrieved successfully",
            isbn: isbn,
            reviewCount: Object.keys(book.reviews).length,
            reviews: book.reviews
        });
    } catch (error) {
        console.error("Error fetching book reviews:", error);
        return res.status(500).json({
            message: "Error fetching book reviews",
            error: error.message
        });
    }
});

const authenticatedUser = (username, password) => {
    const user = users.find(user => user.username === username);
    return user && user.password === password;
}

// Login route
public_users.post("/login", async function (req, res) {
    try {
        console.log("Login request received");
        console.log("Request body:", req.body);

        const username = req.body.username;
        const password = req.body.password;

        // Validate request body
        if (!req.body || Object.keys(req.body).length === 0) {
            return res.status(400).json({
                message: "Login failed",
                error: "Request body is required"
            });
        }

        // Validate username and password
        if (!username || !password) {
            return res.status(400).json({
                message: "Login failed",
                error: "Username and password are required"
            });
        }

        // Simulating an async operation with a delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Check if user exists and password matches
        if (!authenticatedUser(username, password)) {
            return res.status(401).json({
                message: "Login failed",
                error: "Invalid username or password"
            });
        }

        // Generate JWT token
        const accessToken = jwt.sign(
            {
                data: username,
                role: 'customer'
            },
            'fingerprint_customer',
            { expiresIn: 60 * 60 } // Token expires in 1 hour
        );

        // Save user session
        req.session.authorization = {
            accessToken,
            username
        };

        return res.status(200).json({
            message: "User successfully logged in",
            username: username,
            token: accessToken
        });
    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({
            message: "Login failed",
            error: "Internal server error"
        });
    }
});

// Add or modify a book review
public_users.put("/auth/review/:isbn", async function (req, res) {
    try {
        const isbn = req.params.isbn;
        const review = req.query.review;
        const username = req.user.data;

        console.log("Review request received");
        console.log("ISBN:", isbn);
        console.log("Review:", review);
        console.log("Username:", username);

        // Validate ISBN
        if (!isbn || isNaN(isbn)) {
            return res.status(400).json({
                message: "Review failed",
                error: "Invalid ISBN format"
            });
        }

        // Validate review
        if (!review || typeof review !== 'string' || review.trim().length === 0) {
            return res.status(400).json({
                message: "Review failed",
                error: "Review text is required"
            });
        }

        // Check if book exists
        if (!books[isbn]) {
            return res.status(404).json({
                message: "Review failed",
                error: "Book not found"
            });
        }

        // Simulating an async operation with a delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Initialize reviews object if it doesn't exist
        if (!books[isbn].reviews) {
            books[isbn].reviews = {};
        }

        // Add or update the review
        books[isbn].reviews[username] = review.trim();

        return res.status(200).json({
            message: "Review added/updated successfully",
            isbn: isbn,
            username: username,
            review: review
        });
    } catch (error) {
        console.error("Error adding/updating review:", error);
        return res.status(500).json({
            message: "Review failed",
            error: "Internal server error"
        });
    }
});

public_users.delete("/auth/review/:isbn", async function (req, res) {
    try {
        const isbn = req.params.isbn;
        const username = req.user.data;

        console.log("Delete review request received");
        console.log("ISBN:", isbn);
        console.log("Username:", username);

        // Validate ISBN
        if (!isbn || isNaN(isbn)) {
            return res.status(400).json({
                message: "Delete review failed",
                error: "Invalid ISBN format"
            });
        }

        // Check if book exists
        if (!books[isbn]) {
            return res.status(404).json({
                message: "Delete review failed",
                error: "Book not found"
            });
        }

        // Check if book has any reviews
        if (!books[isbn].reviews || Object.keys(books[isbn].reviews).length === 0) {
            return res.status(404).json({
                message: "Delete review failed",
                error: "No reviews found for this book"
            });
        }

        // Check if user has a review for this book
        if (!books[isbn].reviews[username]) {
            return res.status(404).json({
                message: "Delete review failed",
                error: "No review found for this user"
            });
        }

        // Simulating an async operation with a delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Delete the user's review
        delete books[isbn].reviews[username];

        return res.status(200).json({
            message: "Review deleted successfully",
            isbn: isbn,
            username: username
        });
    } catch (error) {
        console.error("Error deleting review:", error);
        return res.status(500).json({
            message: "Delete review failed",
            error: "Internal server error"
        });
    }
});

// Get the book list available in the shop using Axios and async/await
public_users.get('/books', async function (req, res) {
    try {
        console.log("Fetching books using Axios");
        
        // Simulating an API call with Axios
        const response = await axios.get('http://localhost:5000/');
        
        if (!response.data || !response.data.books) {
            return res.status(404).json({
                message: "Error fetching books",
                error: "No books data received"
            });
        }

        return res.status(200).json({
            message: "Books retrieved successfully using Axios",
            count: Object.keys(response.data.books).length,
            books: response.data.books
        });
    } catch (error) {
        console.error("Error fetching books with Axios:", error.message);
        return res.status(500).json({
            message: "Error fetching books",
            error: error.message
        });
    }
});

// Get the book list available in the shop using Promise callbacks
public_users.get('/books/promise', function (req, res) {
    console.log("Fetching books using Promise callbacks");
    
    axios.get('http://localhost:5000/')
        .then(response => {
            if (!response.data || !response.data.books) {
                return res.status(404).json({
                    message: "Error fetching books",
                    error: "No books data received"
                });
            }

            return res.status(200).json({
                message: "Books retrieved successfully using Promise callbacks",
                count: Object.keys(response.data.books).length,
                books: response.data.books
            });
        })
        .catch(error => {
            console.error("Error fetching books with Promise:", error.message);
            return res.status(500).json({
                message: "Error fetching books",
                error: error.message
            });
        });
});

// Get book details based on ISBN using Axios and async/await
public_users.get('/books/isbn/:isbn', async function (req, res) {
    try {
        const isbn = req.params.isbn;
        console.log("Fetching book details using Axios for ISBN:", isbn);
        
        // Validate ISBN format
        if (!isbn || isNaN(isbn)) {
            return res.status(400).json({
                message: "Error fetching book details",
                error: "Invalid ISBN format"
            });
        }

        // Simulating an API call with Axios
        const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
        
        if (!response.data || !response.data.book) {
            return res.status(404).json({
                message: "Error fetching book details",
                error: "Book not found"
            });
        }

        return res.status(200).json({
            message: "Book details retrieved successfully using Axios",
            isbn: isbn,
            book: response.data.book
        });
    } catch (error) {
        console.error("Error fetching book details with Axios:", error.message);
        if (error.response && error.response.status === 404) {
            return res.status(404).json({
                message: "Error fetching book details",
                error: "Book not found"
            });
        }
        return res.status(500).json({
            message: "Error fetching book details",
            error: error.message
        });
    }
});

// Get book details based on ISBN using Promise callbacks
public_users.get('/books/isbn/:isbn/promise', function (req, res) {
    const isbn = req.params.isbn;
    console.log("Fetching book details using Promise callbacks for ISBN:", isbn);
    
    // Validate ISBN format
    if (!isbn || isNaN(isbn)) {
        return res.status(400).json({
            message: "Error fetching book details",
            error: "Invalid ISBN format"
        });
    }

    axios.get(`http://localhost:5000/isbn/${isbn}`)
        .then(response => {
            if (!response.data || !response.data.book) {
                return res.status(404).json({
                    message: "Error fetching book details",
                    error: "Book not found"
                });
            }

            return res.status(200).json({
                message: "Book details retrieved successfully using Promise callbacks",
                isbn: isbn,
                book: response.data.book
            });
        })
        .catch(error => {
            console.error("Error fetching book details with Promise:", error.message);
            if (error.response && error.response.status === 404) {
                return res.status(404).json({
                    message: "Error fetching book details",
                    error: "Book not found"
                });
            }
            return res.status(500).json({
                message: "Error fetching book details",
                error: error.message
            });
        });
});

// Get book details based on author using Axios and async/await
public_users.get('/books/author/:author', async function (req, res) {
    try {
        const author = req.params.author;
        console.log("Fetching books using Axios for author:", author);
        
        // Validate author parameter
        if (!author || typeof author !== 'string') {
            return res.status(400).json({
                message: "Error fetching books",
                error: "Invalid author parameter"
            });
        }

        // Simulating an API call with Axios
        const response = await axios.get(`http://localhost:5000/author/${encodeURIComponent(author)}`);
        
        if (!response.data || !response.data.books) {
            return res.status(404).json({
                message: "Error fetching books",
                error: "No books found for this author"
            });
        }

        return res.status(200).json({
            message: "Books retrieved successfully using Axios",
            count: response.data.count,
            books: response.data.books
        });
    } catch (error) {
        console.error("Error fetching books with Axios:", error.message);
        if (error.response && error.response.status === 404) {
            return res.status(404).json({
                message: "Error fetching books",
                error: "No books found for this author"
            });
        }
        return res.status(500).json({
            message: "Error fetching books",
            error: error.message
        });
    }
});

// Get book details based on author using Promise callbacks
public_users.get('/books/author/:author/promise', function (req, res) {
    const author = req.params.author;
    console.log("Fetching books using Promise callbacks for author:", author);
    
    // Validate author parameter
    if (!author || typeof author !== 'string') {
        return res.status(400).json({
            message: "Error fetching books",
            error: "Invalid author parameter"
        });
    }

    axios.get(`http://localhost:5000/author/${encodeURIComponent(author)}`)
        .then(response => {
            if (!response.data || !response.data.books) {
                return res.status(404).json({
                    message: "Error fetching books",
                    error: "No books found for this author"
                });
            }

            return res.status(200).json({
                message: "Books retrieved successfully using Promise callbacks",
                count: response.data.count,
                books: response.data.books
            });
        })
        .catch(error => {
            console.error("Error fetching books with Promise:", error.message);
            if (error.response && error.response.status === 404) {
                return res.status(404).json({
                    message: "Error fetching books",
                    error: "No books found for this author"
                });
            }
            return res.status(500).json({
                message: "Error fetching books",
                error: error.message
            });
        });
});

// Get book details based on title using Axios and async/await
public_users.get('/books/title/:title', async function (req, res) {
    try {
        const title = req.params.title;
        console.log("Fetching books using Axios for title:", title);
        
        // Validate title parameter
        if (!title || typeof title !== 'string') {
            return res.status(400).json({
                message: "Error fetching books",
                error: "Invalid title parameter"
            });
        }

        // Simulating an API call with Axios
        const response = await axios.get(`http://localhost:5000/title/${encodeURIComponent(title)}`);
        
        if (!response.data || !response.data.books) {
            return res.status(404).json({
                message: "Error fetching books",
                error: "No books found with this title"
            });
        }

        return res.status(200).json({
            message: "Books retrieved successfully using Axios",
            count: response.data.count,
            books: response.data.books
        });
    } catch (error) {
        console.error("Error fetching books with Axios:", error.message);
        if (error.response && error.response.status === 404) {
            return res.status(404).json({
                message: "Error fetching books",
                error: "No books found with this title"
            });
        }
        return res.status(500).json({
            message: "Error fetching books",
            error: error.message
        });
    }
});

// Get book details based on title using Promise callbacks
public_users.get('/books/title/:title/promise', function (req, res) {
    const title = req.params.title;
    console.log("Fetching books using Promise callbacks for title:", title);
    
    // Validate title parameter
    if (!title || typeof title !== 'string') {
        return res.status(400).json({
            message: "Error fetching books",
            error: "Invalid title parameter"
        });
    }

    axios.get(`http://localhost:5000/title/${encodeURIComponent(title)}`)
        .then(response => {
            if (!response.data || !response.data.books) {
                return res.status(404).json({
                    message: "Error fetching books",
                    error: "No books found with this title"
                });
            }

            return res.status(200).json({
                message: "Books retrieved successfully using Promise callbacks",
                count: response.data.count,
                books: response.data.books
            });
        })
        .catch(error => {
            console.error("Error fetching books with Promise:", error.message);
            if (error.response && error.response.status === 404) {
                return res.status(404).json({
                    message: "Error fetching books",
                    error: "No books found with this title"
                });
            }
            return res.status(500).json({
                message: "Error fetching books",
                error: error.message
            });
        });
});

module.exports.general = public_users;
