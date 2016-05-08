var Book = require('../../models/Book.js');
var filter = require('../../models/Filter.js');

module.exports = function(app) {
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
          errType: 0
        });
      } else {
        res.send({
          errType: 0
        });
      };
    });
  });

  // Likes, Rates and Comments
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
    // now.setFullYear();
    // now.setDate(now.getDate()+num);
    var expTime = new Date();
    expTime.setDate(now.getDate() + num);
    return expTime;
  };


};
