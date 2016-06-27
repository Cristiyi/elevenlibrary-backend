var User = require('../../models/User.js'); //User mocule
var bluepage = require('ibm_bluepages');
var filter = require('../../models/Filter.js');

module.exports = function(app) {
  app.post('/api/login/admin', function(req, res) {
    var intrID = req.body.intrID;
    var pwd = req.body.pwd;
    if (intrID && pwd) {
      if (filter.admin.id == intrID) {
        if (filter.admin.pwd == pwd) {
          req.session.adminUserID = filter.admin.id;
          console.log('[AdminLogin]Login Successfully');
          res.json({
            'errType': 0
          });
        } else {
          console.log('[AdminLogin]Wrong Password');
          res.json({
            'errType': 2
          });
        }
      } else {
        console.log('[AdminLogin]intrID incorrect');
        res.json({
          'errType': 1
        });
      }
    } else {
      console.log('[AdminLogin]intrID or pwd is null');
    }
  });

  app.post('/api/login/user', function(req, res) {
    var intrID = req.body.intrID;
    var pwd = req.body.pwd;

    bluepage.authenticate(intrID, pwd, function(success) {
      if (success) {
        bluepage.getPersonInfoByIntranetID(intrID, function(result) {
          if (result === 'error') {
            res.send({
              errType: 1
            });
          } else {
            var phoneNum = result.userTelephonenumber.slice(result.userTelephonenumber.indexOf('-')).replace(/[\-]+/g, '');
            var newUser = {
              'intrID': intrID,
              'name': result.userName,
              'phoneNum': phoneNum
            };
            var profile = {
              intrID: intrID,
              pwd: pwd,
              name: result.userName
            };
            req.session.user_id = intrID;
            req.session.user = result.userName;
            User.findOne({
              'intrID': intrID
            }, function(err, user) {
              if (err) {
                res.send({
                  errType: 1
                });
              } else if (!user) {
                User.create(newUser, function(err, user) {
                  res.send({
                    errType: 0,
                    name: result.userName,
                    phoneNum: phoneNum
                  });
                });
              } else {
                User.findByIdAndUpdate({
                  _id: user._id
                }, newUser, function(err, user) {
                  res.send({
                    errType: 0,
                    name: result.userName,
                    phoneNum: phoneNum
                  });
                });
              };
            })
            console.log('GetNameByIntranetID', result);
          }
        });
      } else {
        res.send({
          errType: 1
        });
      };
    });
  });

  app.post('/api/logout/admin', function(req, res) {
    req.session.destroy(function(err) {
      res.send(err);
    });
  });

  app.post('/api/logout/user', function(req, res) {
    req.session.destroy(function(err) {
      res.send(err);
    });
  });

};
