var Book = require('../../models/Book.js');
var filter = require('../../models/Filter.js');
var logger = require("../../logHelper").helper;
var Mail = require('../../models/mail.js');

module.exports = function(app) {
  // get all books
  app.get('/api/admin/books', filter.adminAuthorize, function(req, res) {
    Book.find(function(err, books) {
      if (err) {
        console.log('[ERROR][GET /api/admin/books]get all books error : ' + err);
        throw err;
      } else {
        res.send(books);
      };
    });
  });

  // add one book
  app.post('/api/admin/books', filter.adminAuthorize, function(req, res) {
    var book = req.body;
    book.status = 0;

    Book.create(book, function(err, newBook) {
      if (err) {
        console.log('[Add a book]DB insert book err : ' + err);
        throw err;
      } else {
        console.log('[Add a book]DB insert book Success');
        res.status(200).send({
          errType: 0,
          _id: newBook._id
        });
      }
    });
  });

  // delete one book
  app.delete('/api/admin/books/:_id', filter.adminAuthorize, function(req, res) {
    var _id = req.params._id;
    Book.remove({ _id: _id }, function(err, delBook) {
      if (err) {
        console.log('[Delete a book]DB delete a book err : ' + err);
        throw err;
        res.json({
          'errType': 3
        });
      } else {
        console.log("[Delete book Success]");
        res.status(200).send({
          errType: 0
        });
      };
    });
  });

  //modify one book
  app.put('/api/admin/books/:_id', filter.adminAuthorize, function(req, res) {
    var mdfBook = req.body;
    var _id = req.params._id;

    Book.update({ _id: _id }, mdfBook, function(err, newBook) {
      if (err) {
        console.log('[update bookprop info]update book info err : ' + err);
        throw err;
        res.json({
          'errType': 3
        });
      } else {
        console.log('[update book info]update book Successfull');
        res.json({
          'errType': 0
        });
        Mail.sendEmail('dlzhjj@cn.ibm.com', '[Elevenlibrary]Admin modified the book :' + mdfBook.name, 'Your book ' + mdfBook.name + ' has been deleted by adminstrator. ', 'http://localhost/project/elevenlibrary-frontend/#/manage/books');
      }
    });
  });
};
