var Book = require('../../models/Book.js');
var History = require('../../models/History.js');
var filter = require('../../models/Filter.js');
var Mail = require('../../models/mail.js');



module.exports = function(app) {
  // get all histories
  app.get('/api/admin/histories', filter.adminAuthorize, function(req, res) {
    History.find({}, function(err, histories) {
      if (err) {
        console.log('[Find histories] Find History DB err : ' + err);
        res.send(err);
      } else {
        res.send(histories);
      };
    });
  });
  // get all confirmations
  app.get('/api/admin/confirmations', filter.adminAuthorize, function(req, res) {
    Book.find({
      confirmed: false
    }, function(err, books) {
      if (err) {
        console.log('[Find applied books] Find books DB err : ' + err);
        res.send(err);
      } else {
        res.send(books);
      };
    });
  });

  // approval confirmation
  app.put('/api/admin/confirmations/:_id', filter.adminAuthorize, function(req, res) {
    var _id = req.params._id;

    Book.findOneAndUpdate({
      _id: _id
    }, {
      confirmed: true
    }, function(err, resbook) {
      if (err) {
        console.log('[Borrow a book] Find the reserved book DB err : ' + err);
        res.json({
          errType: 1,
        });
      } else {
        res.json({
          errType: 0,
        });
        Mail.sendEmail(resbook.ownerIntrID, '[Elevenlibrary]Your book '  + resbook.name + ' has been approved by adminstrator.', 'Your book <strong>'  + resbook.name + '</strong> has been approved by adminstrator.', 'book/'+resbook._id);
      };
    });
  });


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
};
