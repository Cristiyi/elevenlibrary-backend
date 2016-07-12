var schedule = require('node-schedule');
var Book = require('./Book.js');
var Mail = require('./mail.js');
var History = require('./History.js');


var popRule = new schedule.RecurrenceRule();
popRule.second = 0;

var popJob = schedule.scheduleJob(popRule, function() {
  getPopularBooks();
});

var expRule = new schedule.RecurrenceRule();
if (process.env.CHECK_HOUR == undefined) {
  if (process.env.CHECK_MINUTE == undefined){
    expRule.minute = 0;
    console.log('CheckExpireBook Job will start every hour.');
  } else {
    expRule.minute = process.env.CHECK_MINUTE;
    console.log('CheckExpireBook Job will start every hour.');
  };
} else {
  var hour = parseInt(process.env.CHECK_HOUR);
  var minute = parseInt(process.env.CHECK_MINUTE);
  expRule.hour = hour;
  expRule.minute = minute;
  console.log('CheckExpireBook Job will start at ' + hour + ':' + minute + ' everyday.');
}


var expJob = schedule.scheduleJob(expRule, function() {
  checkExpireBook();
});

getPopularBooks();
// checkExpireBook();
console.log('[GetPopularBooks] start at ' + Date().toLocaleString());

function getPopularBooks() {
  Book.find({
    category: {
      $ne: 'Mobile Asset'
    },
    confirmed: true,
  }, null, {
    limit: 4
  }, function(err, books) {
    exports.popularBooks = books;
  }).sort({ likesCount: -1 });
};

function checkExpireBook() {
  console.log('[CheckExpireBook] start at ' + Date().toLocaleString());
  Book.find({
    status: {
      $ne: 0
    },
    confirmed: true,
  }, function(err, books) {
    var now = new Date();
    for (var i in books) {
      if (books[i].status == 1 && books[i].applyTime != undefined) {
        if (getExpireTime(books[i].applyTime, 2).getTime() < now.getTime()) {
          console.log(books[i].name + '(' + books[i]._id + ') has been cancelled automatically.');
          Book.findOneAndUpdate({
            _id: books[i]._id,
            status: 1,
            intrID: books[i].intrID
          }, {
            status: 0,
            $unset: {
              intrID: '',
              applyTime: null
            }
          }, function(err, book) {
            var history = {
              intrID: books[i].intrID,
              name: books[i].name,
              content: books[i].name + ' has been cancelled automatically.'
            };
            History.create(history);
          });
        };
      } else if (books[i].status == 2 && books[i].borrowTime != undefined) {
        // var date = books[i].borrowTime;
        var dueDate = format(books[i].borrowTime);
        // console.log('Borrow Time + 30:', format(getExpireTime(books[i].borrowTime, 30)), '\nBorrow Time + 29:', format(getExpireTime(books[i].borrowTime, 29)), '\nBorrow Time + 28:', format(getExpireTime(books[i].borrowTime, 28)), '\nBorrow Time + 27:', format(getExpireTime(books[i].borrowTime, 27)));
        if (getExpireTime(books[i].borrowTime, 30).getTime() < now.getTime()) {
          console.log('Now:',format(now),' BorrowTime + 30:', format(getExpireTime(books[i].borrowTime, 30)));
          Mail.sendEmail(books[i].intrID, books[i].name + ' is overdue now. Please return it as soon as possible.', 'You borrowed <strong>' + books[i].name + '</strong> on ' + dueDate + '. It\'s overdue now, please return it to its owner <a href="http://faces.tap.ibm.com/bluepages/profile.html?email=' + books[i].ownerIntrID + '" target="_blank">' + books[i].ownerIntrID + '</a> as soon as possible. Thank you.', 'book/' + books[i]._id);
          Mail.sendEmail(books[i].ownerIntrID, books[i].name + ' is overdue now. Please get it back as soon as possible.', 'You lent <strong>' + books[i].name + '</strong> on ' + dueDate + '. It\'s overdue now, please get it back from <a href="http://faces.tap.ibm.com/bluepages/profile.html?email=' + books[i].intrID + '" target="_blank">' + books[i].intrID + '</a> as soon as possible.', 'book/' + books[i]._id);
          var history = {
            intrID: books[i].intrID,
            name: books[i].name,
            content: books[i].name + ' is overdue now.'
          };
          History.create(history);
          console.log(books[i].name + '(' + books[i]._id + ') is overdue now.');
        } else if (getExpireTime(books[i].borrowTime, 29).getTime() < now.getTime()) {
          console.log('Now:',format(now),' BorrowTime + 29:', format(getExpireTime(books[i].borrowTime, 29)));
          Mail.sendEmail(books[i].intrID, books[i].name + ' will be overdue tomorrow. Please return it as soon as possible.', 'You borrowed <strong>' + books[i].name + '</strong> on ' + dueDate + '. It will be overdue tomorrow, please return it to its owner <a href="http://faces.tap.ibm.com/bluepages/profile.html?email=' + books[i].ownerIntrID + '" target="_blank">' + books[i].ownerIntrID + '</a> as soon as possible. Thank you.', 'book/' + books[i]._id);
          var history = {
            intrID: books[i].intrID,
            name: books[i].name,
            content: books[i].name + ' will be overdue tomorrow.'
          };
          History.create(history);
          console.log(books[i].name + '(' + books[i]._id + ') will be overdue tomorrow.');
        } else if (getExpireTime(books[i].borrowTime, 28).getTime() < now.getTime()) {
          console.log('Now:',format(now),' BorrowTime + 28:', format(getExpireTime(books[i].borrowTime, 28)));
          Mail.sendEmail(books[i].intrID, books[i].name + ' will be overdue the day after tomorrow. Please return it as soon as possible.', 'You borrowed <strong>' + books[i].name + '</strong> on ' + dueDate + '. It will be overdue the day after tomorrow, please return it to its owner <a href="http://faces.tap.ibm.com/bluepages/profile.html?email=' + books[i].ownerIntrID + '" target="_blank">' + books[i].ownerIntrID + '</a> as soon as possible. Thank you.', 'book/' + books[i]._id);
          var history = {
            intrID: books[i].intrID,
            name: books[i].name,
            content: books[i].name + ' will be overdue the day after tomorrow.'
          };
          History.create(history);
          console.log(books[i].name + '(' + books[i]._id + ') will be overdue the day after tomorrow.');
        } else if (getExpireTime(books[i].borrowTime, 27).getTime() < now.getTime()) {
          console.log('Now:',format(now),' BorrowTime + 27:', format(getExpireTime(books[i].borrowTime, 27)));
          Mail.sendEmail(books[i].intrID, books[i].name + ' will be overdue three days later. Please return it as soon as possible.', 'You borrowed <strong>' + books[i].name + '</strong> on ' + dueDate + '. It will be overdue three days later, please return it to its owner <a href="http://faces.tap.ibm.com/bluepages/profile.html?email=' + books[i].ownerIntrID + '" target="_blank">' + books[i].ownerIntrID + '</a> as soon as possible. Thank you.', 'book/' + books[i]._id);
          var history = {
            intrID: books[i].intrID,
            name: books[i].name,
            content: books[i].name + ' will be overdue three days later.'
          };
          History.create(history);
          console.log(books[i].name + '(' + books[i]._id + ') will be overdue three days later.');
        };
      }
    }
  });
};

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
