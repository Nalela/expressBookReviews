const express = require("express");
const axios = require("axios");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

// Function to get the list of books using a Promise
const getBooks = () => {
  return new Promise((resolve, reject) => {
    axios
      .get("http://external-api-url/books")
      .then((response) => resolve(response.data))
      .catch((error) => reject("Error fetching books"));
  });
};

// Get the list of books using async-await
public_users.get("/", async (req, res) => {
  try {
    const booksList = await getBooks();
    return res.status(200).send(JSON.stringify(booksList, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error fetching books" });
  }
});

// Function to get book details by ISBN using a Promise
const getBookByISBN = (isbn) => {
  return new Promise((resolve, reject) => {
    axios
      .get(`http://external-api-url/books/${isbn}`)
      .then((response) => resolve(response.data))
      .catch((error) => reject("Book not found"));
  });
};

// Get book details based on ISBN using async-await
public_users.get("/isbn/:isbn", async (req, res) => {
  const { isbn } = req.params;
  try {
    const book = await getBookByISBN(isbn);
    return res.status(200).json(book);
  } catch (error) {
    return res.status(404).json({ message: error });
  }
});

// Function to get books by author using a Promise
const getBooksByAuthor = (author) => {
  return new Promise((resolve, reject) => {
    axios
      .get(`http://external-api-url/books?author=${author}`)
      .then((response) => resolve(response.data))
      .catch((error) => reject("Books not found for this author"));
  });
};

// Get book details based on author using async-await
public_users.get("/author/:author", async (req, res) => {
  const { author } = req.params;
  try {
    const authorBooks = await getBooksByAuthor(author);
    return res.status(200).json(authorBooks);
  } catch (error) {
    return res.status(404).json({ message: error });
  }
});

// Function to get books by title using a Promise
const getBooksByTitle = (title) => {
  return new Promise((resolve, reject) => {
    axios
      .get(`http://external-api-url/books?title=${title}`)
      .then((response) => resolve(response.data))
      .catch((error) => reject("Books not found with this title"));
  });
};

// Get book details based on title using async-await
public_users.get("/title/:title", async (req, res) => {
  const { title } = req.params;
  try {
    const titleBooks = await getBooksByTitle(title);
    return res.status(200).json(titleBooks);
  } catch (error) {
    return res.status(404).json({ message: error });
  }
});

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }
  if (isValid(username)) {
    return res.status(409).json({ message: "Username already exists" });
  }
  users.push({ username, password });
  return res.status(201).json({ message: "User registered successfully" });
});

// Get book review
public_users.get("/review/:isbn", function (req, res) {
  const { isbn } = req.params;
  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }
  return res.status(200).json(book.reviews);
});

module.exports.general = public_users;
