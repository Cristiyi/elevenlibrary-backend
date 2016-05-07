var Book = require('../models/Book.js');


exports.admin = {
  id: 'libadmin@cn.ibm.com',
  pwd: 'libadmin'
};

exports.authorize = function(req, res, next) {
  if (!req.session.user_id) {
    res.status(401).send('User');
  } else {
    next();
  }
};

exports.adminAuthorize = function(req, res, next) {
  if (!req.session.adminUserID || req.session.adminUserID != exports.admin.id) {
    res.status(401).send('Admin');
  } else {
    next();
  }
};

exports.cancelExpiredBook = function(_id) {
  console.log('cancelExpiredBook _id:', _id);
  Book.findByIdAndUpdate({
    _id: _id
  }, {
    status: 0,
    $unset: {
      intrID: '',
      applyTime: null,
      borrowTime: null,
      returnTime: null
    }
  }, function(err, book){
    console.log('cancelExpiredBook err:', err, book);
  });
};

