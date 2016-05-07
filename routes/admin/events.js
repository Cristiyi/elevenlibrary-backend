var Book = require('../../models/Book.js');
var BookProp = require('../../models/BookProp.js');
var History = require('../../models/History.js');
var filter = require('../../models/Filter.js');


module.exports = function(app) {
  // get all events
  app.get('/api/admin/events', filter.adminAuthorize, function(req, res) {
    Book.find({
      status: {
        '$in': [1, 2]
      }
    }, function(err, books) {
      if (err) {
        console.log('[Find applied books] Find books DB err : ' + err);
      } else {
        var eventBooks = [];
        for (var i in books) {
          if (books[i].status == 1 && books[i].applyTime < new Date(new Date().valueOf() - 2 * 24 * 60 * 60 * 1000)) {
            filter.cancelExpiredBook(books[i]._id);
            books[i].status = 0;
            delete books[i].applyTime;
            delete books[i].intrID;
            continue;
          };
          eventBooks.push(books[i]);
        };
        console.log('[Find applied books] Find all reserved books Successful');
        res.json(eventBooks);
      }
    }).sort({
      applyTime: -1
    });
  });
  //
  app.put('/api/admin/events/:unqId', filter.adminAuthorize, function(req, res) {
    var unqId = req.params.unqId;
    var intrID = req.body.intrId;

    Book.findOne({
      unqId: unqId
    }, function(err, resbook) {
      if (err) {
        console.log('[Borrow a book] Find the reserved book DB err : ' + err);
      } else if (getExpireTime(resbook.applyTime, 2) < new Date()) {
        console.log('[Borrow a book] The book has expired');
      } else {
        User.findOne({
          intrID: intrID
        }, function(err, buser) {
          if (err) {
            console.log('[User borrowed Books] This user borrowed books DB err : ' + err);
          } else {
            var addborrower = {
              intrID: buser.intrID,
              name: buser.name
            };
            resbook.borrower.push(addborrower);
            var bTime = new Date();
            var rTime = getExpireTime(bTime, 30);
            Book.update({
              unqId: unqId
            }, {
              status: 2,
              borrowTime: bTime,
              returnTime: rTime,
              intrID: intrID,
              borrower: resbook.borrower
            }, function(err, bbook) {
              if (err) {
                console.log('[Borrow a book] Upate book status and time DB err : ' + err);
              } else if (!bbook.nModified) {
                console.log('[Borrow a book] Upate book status and time Fail');
              } else {
                var borrowbook = {
                  unqId: unqId,
                  name: resbook.name
                }
                buser.borrowedBooks.push(borrowbook);
                User.update({
                  intrID: intrID
                }, {
                  borrowedBooks: buser.borrowedBooks
                }, function(err, addbook) {
                  if (err) {
                    console.log('[User borrowed Books] Update user borrowed books DB err : ' + err);
                  } else if (addbook.nModified) {
                    console.log('[User borrowed Books] Update user borrowed books Successful');
                  } else {
                    console.log('[User borrowed Books] Update user borrowed books Fail');
                  }
                });
                console.log('[Borrow a book] Upate book status and time Successful');
                res.json({
                  errType: 0,
                  borrowTime: bTime,
                  returnTime: rTime
                });
              }
            });
          }
        });
      }
    });
  });

  //return one book
  app.post('/api/admin/events/:unqId', filter.adminAuthorize, function(req, res) {
    var unqId = req.params.unqId;
    // var intrID = req.body.intrId;

    Book.findOne({
      unqId: unqId
    }, function(err, resbook) {
      if (err) {
        console.log('[Return a book] Find the reserved book DB err : ' + err);
      } else {
        User.findOne({
          intrID: resbook.intrID
        }, function(err, buser) {
          if (err) {
            console.log('[User Returned Books] This user borrowed books DB err : ' + err);
          } else {
            Book.update({
              unqId: unqId
            }, {
              status: 0,
              $unset: {
                intrID: '',
                applyTime: null,
                borrowTime: null,
                returnTime: null
              }
            }, function(err, bbook) {
              if (err) {
                console.log('[Return a book] Upate book status and time DB err : ' + err);
              } else if (!bbook.nModified) {
                console.log('[Return a book] Upate book status and time Fail');
              } else {
                var borrowedbooks = [];
                for (var i = buser.borrowedBooks.length - 1; i >= 0; i--) {
                  if (buser.borrowedBooks[i].unqId == unqId) {
                    // delete buser.borrowedBooks[i];
                  } else {
                    borrowedbooks.push(buser.borrowedBooks[i]);
                  }
                };
                User.update({
                  intrID: resbook.intrID
                }, {
                  borrowedBooks: borrowedbooks
                }, function(err, addbook) {
                  if (err) {
                    console.log('[User Returned Books] Update user borrowed books DB err : ' + err);
                  } else if (addbook.nModified) {
                    console.log('[User Returned Books] Update user borrowed books Successful');
                  } else {
                    console.log('[User Returned Books] Update user borrowed books Fail');
                  }
                });
                console.log('[Return a book] Upate book status and time Successful');
                res.json({
                  errType: 0
                });
              }
            });
          }
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
