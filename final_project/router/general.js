const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


const doesExist = (username) => {
    // Filter the users array for any user with the same username
    let userswithsamename = users.filter((user) => {
        return user.username === username;
    });
    // Return true if any user with the same username is found, otherwise false
    if (userswithsamename.length > 0) {
        return true;
    } else {
        return false;
    }
}

public_users.post("/register", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;

    // Check if both username and password are provided
    if (username && password) {
        // Check if the user does not already exist
        if (!doesExist(username)) {
            // Add the new user to the users array
            users.push({"username": username, "password": password});
            return res.status(200).json({message: "User successfully registered. Now you can login"});
        } else {
            return res.status(404).json({message: "User already exists!"});
        }
    }
    // Return error if username or password is missing
    return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
 public_users.get('/', async function (req, res) {
    try {
        const getBooks = () => new Promise((resolve, reject) => {
          if (books) resolve(books);
          else reject("No books found");
        });
    
        const bookList = await getBooks();
        return res.status(200).json(bookList);
      } catch (err) {
        return res.status(500).json({ message: err });
      }
  });  

// Get book details based on ISBN
public_users.get('/isbn/:isbn', async function (req, res) {
    const isbn = req.params.isbn;
  
    const getBookByIsbn = (isbn) => new Promise((resolve, reject) => {
      const book = books[isbn];
      if (book) resolve(book);
      else reject("Book not found");
    });
  
    try {
      const book = await getBookByIsbn(isbn);
      return res.status(200).json(book);
    } catch (err) {
      return res.status(404).json({ message: err });
    }
  });
  
  
// Get book details based on author
public_users.get('/author/:author', async function (req, res) {
    const author = req.params.author;
  
    try {
      // Wrap in a Promise for async/await demonstration
      const getBooksByAuthor = (author) => new Promise((resolve, reject) => {
        const matchedBooks = Object.values(books).filter(book =>
          book.author.toLowerCase() === author.toLowerCase()
        );
        if (matchedBooks.length > 0) resolve(matchedBooks);
        else reject("Book not found");
      });
  
      const booksByAuthor = await getBooksByAuthor(author);
      return res.status(200).json(booksByAuthor);
  
    } catch (error) {
      return res.status(404).json({ message: error });
    }
  });
  
  

// Get all books based on title
public_users.get('/title/:title',async function (req, res) {
    const title = req.params.title;
  
    try {
        const getBooksByTitle = (title)=> new Promise ((resolve,reject)=>{
            const matchedBooks = Object.values(books).filter(book => 
                book.title.toLowerCase() === title.toLowerCase()
              );
            
              if (matchedBooks.length > 0) {
                resolve(matchedBooks);
              }  else reject("Book not found");           
        })

      const booksByTitle = await getBooksByAuthor(title);
      return res.status(200).json(booksByTitle);

    } catch (error) {
        return res.status(404).json({ message: error });
    }
    // Convert books object to an array of its values

});

//  Get book review
public_users.get('/review/:isbn',async function (req, res) {
    const isbn = req.params.isbn;
    const bookReviews = books[isbn].reviews; // Access book review by key
  
    if (bookReviews) {
      return res.status(200).json(bookReviews); // Send the book details
    } else {
      return res.status(404).json({ message: "Book review not found" });
    }
});

module.exports.general = public_users;
