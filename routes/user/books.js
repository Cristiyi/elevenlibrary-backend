var Book = require('../../models/Book.js');
var BookProp = require('../../models/BookProp.js');
var filter = require('../../models/Filter.js');

module.exports = function(app) {
  app.get('/api/user/books', function(req, res) {
    Book.find(function(err, books) {
      if (err) {
        console.log("[Query books] DB error !");
        res.send(err);
      } else {
        BookProp.find(function(err, booksprop) {
          if (err) {
            console.log("[Query BookProp] DB error !");
            res.send(err);
          } else {
            var newBooks = [];
            for (var i = 0; i < books.length; i++) {
              if (books[i].status == 1 && books[i].applyTime < new Date(new Date().valueOf() - 2 * 24 * 60 * 60 * 1000)) {
                filter.cancelExpiredBook(books[i]._id);
                books[i].status = 0;
                books[i].intrID = '';
                delete books[i].applyTime;
                delete books[i].borrowTime;
                delete books[i].returnTime;
              };
              for (var j = 0; j < booksprop.length; j++) {
                if (books[i].isbn == booksprop[j].isbn) {
                  var book = {};
                  book.unqId = books[i].unqId;
                  book.isbn = books[i].isbn;
                  book.status = books[i].status;
                  book.applyTime = books[i].applyTime;
                  book.borrowTime = books[i].borrowTime;
                  book.returnTime = books[i].returnTime;
                  book.intrID = books[i].intrID;
                  book.borrower = books[i].borrower;
                  book.name = booksprop[j].name;
                  book.category = booksprop[j].category;
                  book.desc = booksprop[j].desc;
                  book.publisher = booksprop[j].publisher;
                  book.author = booksprop[j].author;
                  book.pageCount = booksprop[j].pageCount;
                  book.price = booksprop[j].price;
                  book.count = booksprop[j].count;
                  book.image = booksprop[j].image;
                  book.likes = booksprop[j].likes;
                  book.rates = booksprop[j].rates;
                  book.comments = booksprop[j].comments;
                  newBooks.push(book);
                  break;
                };
              };
            };
            res.send(newBooks);
          };
        });
      };
    });
  });

  // Likes, Rates and Comments
  app.put('/api/user/book/:isbn/like', filter.authorize, function(req, res) {
    var isbn = req.params.isbn;
    var intrID = req.body.intrID;
    var ifYou = req.body.ifYou;
    if (ifYou) {
      BookProp.findOneAndUpdate({
        isbn: isbn
      }, {
        $push: {
          likes: intrID
        }
      }, function(err, book) {
        BookProp.findById({
          _id: book._id
        }, function(err, book_new) {
          res.send(book_new.likes);
        });
      });
    } else {
      BookProp.findOneAndUpdate({
        isbn: isbn
      }, {
        $pull: {
          likes: intrID
        }
      }, function(err, book) {
        BookProp.findById({
          _id: book._id
        }, function(err, book_new) {
          res.send(book_new.likes);
        });
      });
    };
  });

  app.put('/api/user/book/:isbn/rate', filter.authorize, function(req, res) {
    var isbn = req.params.isbn;
    var intrID = req.body.intrID;
    var value = req.body.value;
    BookProp.findOneAndUpdate({
      isbn: isbn
    }, {
      $push: {
        rates: {
          intrID: intrID,
          value: value
        }
      }
    }, function(err, book) {
      BookProp.findById({
        _id: book._id
      }, function(err, book_new) {
        res.send(book_new.rates);
      });
    })
  });

  app.put('/api/user/book/:isbn/comment', filter.authorize, function(req, res) {
    var isbn = req.params.isbn;
    var intrID = req.body.intrID;
    var content = req.body.content;
    BookProp.update({
      isbn: isbn
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
        BookProp.findOne({
          isbn: isbn
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

  app.delete('/api/user/book/:isbn/comment/:id', filter.authorize, function(req, res) {
    var isbn = req.params.isbn;
    var id = req.params.id;
    console.log('id=', id);
    BookProp.update({
      isbn: isbn,
      count: {
        $ne: 0
      }
    }, {
      $pull: {
        comments: {
          _id: id
        }
      }
    }, function(err, book) {
      if (err) {
        console.log(err);
        res.send(err);
      } else {
        BookProp.findOne({
          isbn: isbn,
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
  app.get('/api/user/book/:isbn/similar', function(req, res) {
    var isbn = req.params.isbn;
    BookProp.findOne({
      isbn: isbn
    }, function(err, book) {
      if (err) {
        res.send(err);
      } else {
        var category = book.category;
        var simBooks = [];
        BookProp.find({
          category: category,
          isbn: {
            $ne: isbn
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

  app.put('/api/user/book/:isbn/borrow', filter.authorize, function(req, res) {

    var intrID = req.body.intrID;
    console.log(intrID);
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
          isbn: req.params.isbn,
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
              unqId: book.unqId
            }, {
              status: 1,
              intrID: intrID,
              applyTime: applyTime
            }, function(err, resbook) {
              if (err) {
                console.log('[Update book status and time] Update book DB err : ' + err);
              } else if (!resbook.nModified) {
                console.log('[Update book status and time] Update book Fail');
              } else {
                console.log('[Update book status and time] Update book Successful');
                res.json({
                  errType: 0,
                  applyTime: applyTime
                });
              }
            });
          }
        });
      }
    });

  }); //apply one book

  app.put('/api/user/book/:isbn/cancelBorrow', filter.authorize, function(req, res) {
    console.log('CancelBorrow start', req.body);
    var intrID = req.body.intrID;
    var isbn = req.params.isbn;
    Book.findOneAndUpdate({
      isbn: isbn,
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
          errType: 0
        });
      } else {
        console.log("[cancelBorrow]book =", book);
        res.send({
          errType: 0
        });
      };
    });
  });

  // app.get('/api/user/:intrID/borrowedbooks', function(req, res) {
  //   var intrID = req.params.intrID;
  //   User.findOne({
  //     intrID: intrID
  //   }, function(err, user) {
  //     res.json({
  //       books: user.borrowedBooks
  //     });
  //   });
  // });

  function getExpireTime(now, num) {
    // now.setFullYear();
    // now.setDate(now.getDate()+num);
    var expTime = new Date();
    expTime.setDate(now.getDate() + num);
    return expTime;
  };


};
