var Book = require('../../models/Book.js');
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
  // deliver one book
  app.put('/api/admin/events/:_id', filter.adminAuthorize, function(req, res) {
    var _id = req.params._id;
    var intrID = req.body.intrId;

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
          intrID: intrID
        }, function(err, bBook) {
          if (err) {
            res.json({
              errType: 1,
            });
          } else {
            res.json({
              errType: 0,
              borrowTime: bTime,
              returnTime: rTime
            });
          }
        });
      }
    });
  });

  //return one book
  app.post('/api/admin/events/:_id', filter.adminAuthorize, function(req, res) {
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
