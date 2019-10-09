/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

var expect = require('chai').expect;
var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
const MONGODB_CONNECTION_STRING = process.env.DB;
//Example connection: MongoClient.connect(MONGODB_CONNECTION_STRING, function(err, db) {});

let LOCAL_DB = false

const MONGO_URI = LOCAL_DB ? 
      `mongodb://${process.env.DB_HOSTNAME}:${process.env.DB_PORT}/${process.env.DB_NAME}` : 
      "mongodb+srv://" +
      process.env.DB_USER +
      ":" +
      process.env.DB_PASS +
      "@cluster0-vakli.mongodb.net/test?retryWrites=true&w=majority"

// Database variables
var db         // database connection variable
var books      // database collection variable

module.exports = function (app) {

  // Connect database
  MongoClient.connect(MONGO_URI, function(err, database) {
    if (err) console.log("Database couldn't connect")
    else {
      console.log("Database connected")
      db = database.db(process.env.DB_NAME)
      books = db.collection('books')
    }
  })
  
  app.route('/api/books')
    .get(function (req, res){
      //response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      books.find({}).toArray((err, result) => {
        if(err) res.send('Error getting the books')
        res.json(result.map(book => ({ _id: book._id, title: book.title, commentcount: book.commentcount })))
      })
    })
    
    .post(function (req, res){
      var title = req.body.title;
    
      //response will contain new book object including atleast _id and title
      if(!title || title === '') return res.send("missing title")

      books.insertOne({ title: title, commentcount: 0, comments: [] }, (err, result) => {
        if(err) res.send("unable to submit the book")
        res.json({ _id: result.ops[0]._id, title: result.ops[0].title })
      })        
    })
    
    .delete(function(req, res){
      //if successful response will be 'complete delete successful'
      books.remove({}, (err, result) => {
                   if(err) res.send('unable to delete all the books')
                   res.send('all the books have been deleted')
                  })
    });



  app.route('/api/books/:id')
    .get(function (req, res){
      var bookid = req.params.id;
    
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      books.findOne({ _id: ObjectId(bookid) }, (err, book) => {
        if(err) res.send('no book exists')
        if(book)
          res.json({ _id: book._id, title: book.title, comments: book.comments })
        else
          res.send('no book exists')
          
      })
    })
    
    .post(function(req, res){
      var bookid = req.params.id;
      var comment = req.body.comment;

      //json res format same as .get
      books.findOneAndUpdate(
          { _id: ObjectId(bookid) },
          { $push: { comments: comment },
            $inc: { commentcount: 1 }},
          { returnOriginal: false }, 
          (err, book) => {
            if(err) res.send('no book exists')
            //res.json({ _id: book.value._id, title: book.value.title, comments: book.value.comments })
            res.json(book.value)
        })
    })
    
    .delete(function(req, res){
      var bookid = req.params.id;
    
      //if successful response will be 'delete successful'
      books.deleteOne(
        { _id: ObjectId(bookid) }, 
        (err) => 
        err ? res.send('Unable to delete the book') : res.send('delete successful'))
    });
  
};
