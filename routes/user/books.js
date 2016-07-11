var Book = require('../../models/Book.js');
var History = require('../../models/History.js');
var filter = require('../../models/Filter.js');
var Mail = require('../../models/mail.js');
var Schedule = require('../../models/schedule.js');


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
    }).sort({ likesCount: -1 });
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
            var applyTime = new Date();
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
                var dueDate = format(getExpireTime(applyTime, 2));
                res.json({
                  errType: 0,
                  applyTime: applyTime
                });
                var history = {
                  intrID: intrID,
                  name: book.name,
                  content: 'User ' + intrID + ' borrowed the book ' + book.name + '.'
                };
                History.create(history);
                Mail.sendEmail(intrID, 'You have reserved ' + book.name + ' successfully.', 'You have reserved <strong>' + book.name + '</strong> successfully, please come to <a href="http://faces.tap.ibm.com/bluepages/profile.html?email=' + book.ownerIntrID + '" target="_blank">' + book.ownerIntrID + '</a> to take it before <strong>' + dueDate + '</strong>, or the request will be cancelled automatically.', 'book/' + book._id);
                Mail.sendEmail(book.ownerIntrID, book.name + ' has been borrowed by ' + intrID, '<strong>' + book.name + '</strong> has been borrowed by <a href="http://faces.tap.ibm.com/bluepages/profile.html?email=' + intrID + '" target="_blank">' + intrID + '</a>, please click on the Deliver button when the user comes to take it.', 'book/' + book._id);
              };
            });
          }
        });
      };
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
        var history = {
          intrID: intrID,
          name: book.name,
          content: 'User ' + intrID + ' cancelled the request for the book ' + book.name + '.'
        };
        History.create(history);
        Mail.sendEmail(book.ownerIntrID, 'User ' + intrID + ' has cancelled the request for ' + book.name, 'User <a href="http://faces.tap.ibm.com/bluepages/profile.html?email=' + intrID + '" target="_blank">' + intrID + '</a> has cancelled the request for <strong>' + book.name + '</strong>', 'book/' + book._id);
        Mail.sendEmail(intrID, 'You have cancelled the request for ' + book.name + ' successfully', 'You have cancelled the request for <strong>' + book.name + '</strong> successfully.', 'book/' + book._id);
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
        res.send(err);
        throw err;
      } else {
        console.log('[Add a book]DB insert book Success');
        res.json({
          errType: 0,
          _id: newBook._id
        });
        var history = {
          intrID: newBook.ownerIntrID,
          name: newBook.name,
          content: 'User ' + newBook.ownerIntrID + ' uploaded the book ' + newBook.name + '.'
        };
        History.create(history);
        Mail.sendEmail(newBook.ownerIntrID, newBook.name + ' has been uploaded successfully.', '<strong>' + newBook.name + '</strong> has been uploaded successfully. It will share to public after the <a href="http://faces.tap.ibm.com/bluepages/profile.html?email=' + Mail.admin + '" target="_blank">Adminstrator</a>\'s approval.', 'book/' + newBook._id);
        Mail.sendEmail(Mail.admin, newBook.name + ' has been uploaded by ' + newBook.ownerIntrID, '<strong>' + newBook.name + '</strong> has been uploaded by <a href="http://faces.tap.ibm.com/bluepages/profile.html?email=' + newBook.ownerIntrID + '" target="_blank">' + newBook.ownerIntrID + '</a>, please confirm and approve the request.', 'book/' + newBook._id);
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
        console.log('[update book info]update book Successfull', newBook);
        res.json({
          'errType': 0
        });
        var history = {
          intrID: mdfBook.ownerIntrID,
          name: mdfBook.name,
          content: 'User ' + mdfBook.ownerIntrID + ' uploaded the book ' + mdfBook.name + '.'
        };
        History.create(history);
        Mail.sendEmail(mdfBook.ownerIntrID, mdfBook.name + ' has been updated successfully.', '<strong>' + mdfBook.name + '</strong> has been updated successfully. It will share to public after the <a href="http://faces.tap.ibm.com/bluepages/profile.html?email=' + Mail.admin + '" target="_blank">Adminstrator</a>\'s approval.', 'book/' + mdfBook._id);
        Mail.sendEmail(Mail.admin, 'The information of ' + mdfBook.name + ' has been updated by ' + mdfBook.ownerIntrID, 'The information of <strong>' + mdfBook.name + '</strong> has been updated by <a href="http://faces.tap.ibm.com/bluepages/profile.html?email=' + mdfBook.ownerIntrID + '"" target="_blank">' + mdfBook.ownerIntrID + '</a>, please confirm and approve the request.', 'book/' + _id);
      }
    });
  });

  //delete one book
  app.delete('/api/user/books/:_id', filter.authorize, function(req, res) {
    var _id = req.params._id;

    Book.findById(_id, function(err, book) {
      if (err) {
        console.log('[update bookprop info]update book info err : ' + err);
        throw err;
        res.send(err);
      } else {
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
            var history = {
              intrID: book.ownerIntrID,
              name: book.name,
              content: 'User ' + book.ownerIntrID + ' deleted the book ' + book.name + '.'
            };
            History.create(history);
            Mail.sendEmail(book.ownerIntrID, book.name + ' has been deleted successfully.', '<strong>' + book.name + '</strong> has been deleted successfully.', 'book/' + book._id);
          }
        });
      }
    })
  });

  // deliver one book
  app.post('/api/user/books/deliver/:_id', filter.authorize, function(req, res) {
    var _id = req.params._id;
    var now = new Date();
    Book.findOne({
      _id: _id
    }, function(err, resbook) {
      if (err) {
        console.log('[Borrow a book] Find the reserved book DB err : ' + err);
      } else if (getExpireTime(resbook.applyTime, 2).getTime() < now.getTime()) {
        console.log('[Borrow a book] The book has expired');
        Book.findOneAndUpdate({
          _id: _id
        }, {
          status: 0,
          $unset: {
            intrID: '',
            applyTime: null
          }
        }, function(err, book) {
          res.json({
            errType: 1
          })
        });
      } else {
        var intrID = resbook.intrID;
        var bTime = new Date();
        var rTime = getExpireTime(bTime, 30);
        console.log('bTime', bTime, '\rTime', rTime);
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
            var history = {
              intrID: resbook.ownerIntrID,
              name: resbook.name,
              content: 'User ' + resbook.ownerIntrID + ' deliverd the book ' + resbook.name + '.'
            };
            History.create(history);
            Mail.sendEmail(resbook.ownerIntrID, resbook.name + ' has been deliverd to ' + intrID + ' successfully', '<strong>' + resbook.name + '</strong> has been deliverd to <a href="http://faces.tap.ibm.com/bluepages/profile.html?email=' + intrID + '"" target="_blank">' + intrID + '</a> successfully, and the due date is <strong>' + format(rTime) + '</strong>.', 'book/' + resbook._id);
            Mail.sendEmail(intrID, 'You have borrowed ' + resbook.name + ' successfully', 'You have borrowed <strong>' + resbook.name + '</strong> successfully, please return it before <strong>' + format(rTime) + '</strong>.', 'book/' + resbook._id);
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
        var intrID = resbook.intrID;
        res.json({
          errType: 0
        });
        var history = {
          intrID: intrID,
          name: book.name,
          content: 'User ' + intrID + ' returned the book ' + book.name + '.'
        };
        History.create(history);
        Mail.sendEmail(resbook.ownerIntrID, resbook.name + ' has been returned successfully', '<strong>' + resbook.name + '</strong> has been returned successfully', 'book/' + resbook._id);
        Mail.sendEmail(intrID, resbook.name + ' has been returned successfully', '<strong>' + resbook.name + '</strong> has been returned successfully', 'book/' + resbook._id);
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
        },
        $inc: {
          likesCount: 1
        },
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
        },
        $inc: {
          likesCount: -1
        },
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

  // Delete comments
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
        }).sort({ likesCount: -1 });
      }
    });
  });

  // GetPopularBooks
  app.get('/api/user/books/popular', function(req, res) {
    res.send(Schedule.popularBooks);
  })

  function getExpireTime(time, num) {
    var date = new Date(time);
    date.setDate(date.getDate() + num);
    return date;
  };

  function add0(m) {
    return m < 10 ? '0' + m : m;
  };

  function format(time) {
    var y = time.getFullYear();
    var m = time.getMonth() + 1;
    var d = time.getDate();
    return y + '-' + add0(m) + '-' + add0(d);
  };
};
