/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

var chaiHttp = require('chai-http');
var chai = require('chai');
var assert = chai.assert;
var server = require('../server');

chai.use(chaiHttp);

var bookid
var randomBookid = '5d9e34ee825b4812fa0732b8'

suite('Functional Tests', function() {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  test('#example Test GET /api/books', function(done){
     chai.request(server)
      .get('/api/books')
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  });
  /*
  * ----[END of EXAMPLE TEST]----
  */
  
  suite('Routing tests', function() {


    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({ title: 'Test book' })
          .end(function(err, res) {
            assert.equal(res.status, 200)
            assert.property(res.body, '_id')
            bookid = res.body._id
            assert.property(res.body, 'title')
            assert.equal(res.body.title, 'Test book')
          })
        done();
      });
      
      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
          .post('/api/books')
          .send({ })
          .end(function(err, res) {
            assert.equal(res.status, 200)
            //console.log(res.text)
            assert.equal(res.text, 'missing title')
          })
        done();
      });
      
    });


    suite('GET /api/books => array of books', function(){
      
      test('Test GET /api/books',  function(done){
        chai.request(server)
          .get('/api/books')
          .end(function(err, res) {
            assert.equal(res.status, 200)
            assert.property(res.body[0], '_id')
            assert.property(res.body[0], 'title')
            assert.property(res.body[0], 'commentcount')
          })
        done();
      });      
      
    });


    suite('GET /api/books/[id] => book object with [id]', function(){
      
      test('Test GET /api/books/[id] with id not in db',  function(done){
        chai.request(server)
          .get('/api/books/' + randomBookid)
          .end(function(err, res) {
            assert.equal(res.status, 200)
            assert.equal(res.text, 'no book exists')
          })
        done();
      });
      
      test('Test GET /api/books/[id] with valid id in db',  function(done){
        chai.request(server)
          .get('/api/books/' + bookid)
          .end(function(err, res) {
            assert.equal(res.status, 200)
            assert.property(res.body, '_id')
            assert.equal(res.body._id, bookid)
            assert.property(res.body, 'title')
            assert.equal(res.body.title, 'Test book')
            assert.property(res.body, 'comments')
          })
        done();
      });
      
    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
      test('Test POST /api/books/[id] with comment', function(done){
        chai.request(server)
          .post('/api/books/' + bookid)
          .send({ comment: 'test comment' })
          .end(function(err, res) {
            assert.equal(res.status, 200)
            //assert.equal(res.body.comments, 'test comment')
            assert.property(res.body, '_id')
            assert.equal(res.body._id, bookid)
            assert.property(res.body, 'title')
            assert.equal(res.body.title, 'Test book')
            assert.property(res.body, 'comments')
            assert.isArray(res.body.comments)
            assert.equal(res.body.comments[0], 'test comment')
          })
        done();
      });
      
    });

  });

});
