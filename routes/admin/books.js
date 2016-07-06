var Book = require('../../models/Book.js');
var filter = require('../../models/Filter.js');
var logger = require("../../logHelper").helper;
var Mail = require('../../models/mail.js');
var History = require('../../models/History.js');

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
    Book.findById({
      _id: _id
    }, function(err, oldBook) {
      if (err) {
        console.log('[Delete a book]DB delete a book err : ' + err);
        throw err;
        res.json({
          'errType': 3
        });
      } else {
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
            Mail.sendEmail(oldBook.ownerIntrID, '[Elevenlibrary]'  + oldBook.name + ' has been deleted by Adminstrator.', '<strong>'  + oldBook.name + '</strong> has been deleted by <a href="http://faces.tap.ibm.com/bluepages/profile.html?email='+Mail.admin+'"" target="_blank">Adminstrator</a>.', 'books/all');
            var history = {
              intrID: 'Adminstrator',
              name: oldBook.name,
              content: 'Adminstrator ' + Mail.admin + ' deleted the book ' + oldBook.name + '.'
            };
            History.create(history);
          };
        });
      }
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
        Mail.sendEmail(mdfBook.ownerIntrID, '[Elevenlibrary]]The information of ' + mdfBook.name + ' has been changed by Adminstrator.', 'The information of <strong>' + mdfBook.name + '</strong> has been changed by <a href="http://faces.tap.ibm.com/bluepages/profile.html?email='+Mail.admin+'"" target="_blank">Adminstrator</a>.', 'book/' + _id);
        var history = {
          intrID: 'Adminstrator',
          name: mdfBook.name,
          content: 'Adminstrator ' + Mail.admin + ' modified the book ' + mdfBook.name + '.'
        };
        History.create(history);
      }
    });
  });
};
