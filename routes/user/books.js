var Book = require('../../models/Book.js');
var filter = require('../../models/Filter.js');

module.exports = function(app) {
  // User get all books
  app.get('/api/user/books', function(req, res) {
    Book.find(function(err, books) {
      if (err) {
        console.log('[ERROR][GET /api/user/books]get all books error : ' + err);
        throw err;
      } else {
        res.send(books);
      };
    });
  });

  // borrow book
  app.put('/api/user/books/borrow/:_id', filter.authorize, function(req, res) {
    var intrID = req.body.intrID;
    var _id = req.params._id;
    Book.find({
      intrID: intrID
    }, function(err, books) {
      if (err) {
        console.log('[Find book] Find book DB err : ' + err);
      } else if (books.length >= 2) {
        res.json({
          errType: 1
        });
      } else {
        Book.findOne({
          _id: _id,
          status: 0
        }, function(err, book) {
          if (err) {
            console.log('[Find available book] Find book DB err : ' + err);
          } else if (!book) {
            console.log('[Find available book]No available book');
            res.json({
              errType: 2
            });
          } else {
            var applyTime = Date();
            Book.update({
              _id: _id
            }, {
              status: 1,
              intrID: intrID,
              applyTime: applyTime
            }, function(err, resbook) {
              if (err) {
                console.log('[Update book status and time] Update book DB err : ' + err);
              } else {
                console.log('[Update book status and time] Update book Successful');
                res.json({
                  errType: 0,
                  applyTime: applyTime
                });
                Mail.sendEmail(book.ownerIntrID, '[Elevenlibrary]Your book '  + book.name + ' has been borrowed by '+intrID, 'Your book '  + book.name + ' has been borrowed by '+intrID+', please click on the Deliver button when the user comes to take the book.', 'book/'+book._id);
                Mail.sendEmail(intrID, '[Elevenlibrary]You have reserved the book '+ book.name +' successfully', 'You have reserved the book '+book.name+' successfully, please come to the owner to take the book within two days, or the request will be cancelled automatically.', 'book/'+book._id);
              }
            });
          }
        });
      }
    });

  });

  // cancel borrow book
  app.put('/api/user/books/cancelBorrow/:_id', filter.authorize, function(req, res) {
    var intrID = req.body.intrID;
    var _id = req.params._id;
    Book.findOneAndUpdate({
      _id: _id,
      status: 1,
      intrID: intrID
    }, {
      status: 0,
      $unset: {
        intrID: '',
        applyTime: null
      }
    }, function(err, book) {
      if (err) {
        req.send({
          errType: 1
        });
      } else {
        res.send({
          errType: 0
        });
        Mail.sendEmail(book.ownerIntrID, '[Elevenlibrary]User '+intrID+' has cancelled the request for the book '+book.name, 'User '+intrID+' has cancelled the request for the book '+book.name, 'book/'+book._id);
        Mail.sendEmail(intrID, '[Elevenlibrary]You have cancelled the request for book '+ book.name +' successfully', 'You have cancelled the request for book '+ book.name +' successfully.', 'book/'+book._id);
      };
    });
  });

  // add one book
  app.post('/api/user/books', filter.authorize, function(req, res) {
    var book = req.body;
    book.status = 0;

    Book.create(book, function(err, newBook) {
      if (err) {
        console.log('[Add a book]DB insert book err : ' + err);
        throw err;
      } else {
        console.log('[Add a book]DB insert book Success');
        res.json({
          errType: 0,
          _id: newBook._id
        });
        // Mail.sendEmail(Mail.admin, '[Elevenlibrary]Book '+newBook.name+' has been uploaded by '+newBook.ownerIntrID, 'Book '+newBook.name+' has been uploaded by '+ newBook.ownerIntrID+', please confirm and approve the request.', 'book/'+book._id);
        Mail.sendEmail(book.ownerIntrID, '[Elevenlibrary]]The information of your book ' + book.name + ' has been changed by adminstrator.', 'The information of your book ' + book.name + 'has been changed by adminstrator ', 'book/' + _id);
      }
    });
  });

  //edit one book
  app.put('/api/user/books/:_id', filter.authorize, function(req, res) {
    var mdfBook = req.body;
    var _id = req.params._id;

    Book.update({ _id: _id }, mdfBook, function(err, newBook) {
      if (err) {
        console.log('[update bookprop info]update book info err : ' + err);
        throw err;
        res.send(err);
      } else {
        console.log('[update book info]update book Successfull');
        res.json({
          'errType': 0
        });
        Mail.sendEmail(Mail.admin, '[Elevenlibrary]The information of the book '+newBook.name+' has been updated by '+ newBook.ownerIntrID, 'The information of the book '+newBook.name+' has been updated by '+ newBook.ownerIntrID +', please confirm and approve the request.', 'book/'+book._id);
      }
    });
  });

  //delete one book
  app.delete('/api/user/books/:_id', filter.authorize, function(req, res) {
    var _id = req.params._id;

    Book.remove({ _id: _id }, function(err, newBook) {
      if (err) {
        console.log('[update bookprop info]update book info err : ' + err);
        throw err;
        res.send(err);
      } else {
        console.log('[update book info]update book Successfull');
        res.json({
          'errType': 0
        });
      }
    });
  });

  // deliver one book
  app.post('/api/user/books/deliver/:_id', filter.authorize, function(req, res) {
    var _id = req.params._id;

    Book.findOne({
      _id: _id
    }, function(err, resbook) {
      if (err) {
        console.log('[Borrow a book] Find the reserved book DB err : ' + err);
      } else if (getExpireTime(resbook.applyTime, 2) < new Date()) {
        console.log('[Borrow a book] The book has expired');
      } else {
        var bTime = new Date();
        var rTime = getExpireTime(bTime, 30);
        Book.update({
          _id: _id
        }, {
          status: 2,
          borrowTime: bTime,
          returnTime: rTime,
        }, function(err, bBook) {
          if (err) {
            console.log(err);
            res.json({
              errType: 1,
            });
          } else {
            res.json({
              errType: 0,
              borrowTime: bTime,
              returnTime: rTime
            });
            Mail.sendEmail(bBook.ownerIntrID, '[Elevenlibrary]Your book '  + bBook.name + ' has been deliverd to '+ intrID +'successfully', 'Your book '  + bBook.name + ' has been deliverd to '+ intrID +'successfully, and the due date is two months later.', 'book/'+bBook._id);
            Mail.sendEmail(intrID, '[Elevenlibrary]You have borrowed the book '+ bBook.name +' successfully', 'You have borrowed the book '+bBook.name+' successfully, please return the book within two months.', 'book/'+bBook._id);
          }
        });
      }
    });
  });

  //return one book
  app.post('/api/user/books/return/:_id', filter.authorize, function(req, res) {
    var _id = req.params._id;
    Book.findOneAndUpdate({
      _id: _id
    }, {
      status: 0,
      $unset: {
        intrID: '',
        applyTime: null,
        borrowTime: null,
        returnTime: null
      }
    }, function(err, resbook) {
      if (err) {
        console.log('[Return a book] Upate book status and time DB err : ' + err);
        res.json({
          errType: 1
        });
      } else {
        res.json({
          errType: 0
        });
        Mail.sendEmail(resbook.ownerIntrID, '[Elevenlibrary]Your book '  + resbook.name + ' has been returned successfully', 'Your book '  + resbook.name + ' has been returned successfully', 'book/'+resbook._id);
        Mail.sendEmail(intrID, '[Elevenlibrary]The book '  + resbook.name + ' has been returned successfully', 'The book '  + resbook.name + ' has been returned successfully', 'book/'+resbook._id);
      }
    });
  });

  // Likes
  app.put('/api/user/books/like/:_id', filter.authorize, function(req, res) {
    var _id = req.params._id;
    var intrID = req.body.intrID;
    var ifYou = req.body.ifYou;
    if (ifYou) {
      Book.findOneAndUpdate({
        _id: _id
      }, {
        $push: {
          likes: intrID
        }
      }, function(err, book) {
        Book.findById({
          _id: book._id
        }, function(err, book_new) {
          res.send(book_new.likes);
        });
      });
    } else {
      Book.findOneAndUpdate({
        _id: _id
      }, {
        $pull: {
          likes: intrID
        }
      }, function(err, book) {
        Book.findById({
          _id: book._id
        }, function(err, book_new) {
          res.send(book_new.likes);
        });
      });
    };
  });

  // Rates
  app.put('/api/user/books/rate/:_id', filter.authorize, function(req, res) {
    var _id = req.params._id;
    var intrID = req.body.intrID;
    var value = req.body.value;
    Book.findOneAndUpdate({
      _id: _id
    }, {
      $push: {
        rates: {
          intrID: intrID,
          value: value
        }
      }
    }, function(err, book) {
      Book.findById({
        _id: book._id
      }, function(err, book_new) {
        res.send(book_new.rates);
      });
    })
  });

  // Comments
  app.put('/api/user/books/comment/:_id', filter.authorize, function(req, res) {
    var _id = req.params._id;
    var intrID = req.body.intrID;
    var content = req.body.content;
    Book.update({
      _id: _id
    }, {
      $push: {
        comments: {
          intrID: intrID,
          content: content,
          time: Date.now()
        }
      }
    }, function(err, book) {
      if (err) {
        console.log(err);
        res.send(err);
      } else {
        Book.findOne({
          _id: _id
        }, function(err, book_new) {
          if (err) {
            console.log(err);
            res.send(err);
          } else {
            res.send(book_new.comments);
          }
        });
      }
    })
  });

  // delete comments
  app.delete('/api/user/books/comment/', filter.authorize, function(req, res) {
    var _id = req.query._id;
    var commentID = req.query.commentID;
    Book.update({
      _id: _id,
      count: {
        $ne: 0
      }
    }, {
      $pull: {
        comments: {
          _id: commentID
        }
      }
    }, function(err, book) {
      if (err) {
        console.log(err);
        res.send(err);
      } else {
        Book.findOne({
          _id: _id,
          count: {
            $ne: 0
          }
        }, function(err, newBook) {
          if (err) {
            console.log(err);
            res.send(err);
          } else {
            console.log(newBook.comments);
            res.send(newBook.comments);
          }
        })
      }
    });
  })

  // GetSimilarBooks
  app.get('/api/user/books/similar/:_id', function(req, res) {
    var _id = req.params._id;
    Book.findOne({
      _id: _id
    }, function(err, book) {
      if (err) {
        res.send(err);
      } else {
        var category = book.category;
        var simBooks = [];
        Book.find({
          category: category,
          confirmed: true,
          _id: {
            $ne: _id
          },
          count: {
            $ne: 0
          },
        }, null, {
          limit: 4
        }, function(err, books) {
          for (var index in books) {
            simBooks.push(books[index]);
          };
          res.send(simBooks);
        });
      }
    });
  });

  function getExpireTime(now, num) {
    var expTime = new Date();
    expTime.setDate(now.getDate() + num);
    return expTime;
  };

};
