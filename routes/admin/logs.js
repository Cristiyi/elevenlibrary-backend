var Log = require('../../models/log.js');
var filter = require('../../models/Filter.js');

module.exports = function(app) {
  app.get('/api/admin/logs', filter.adminAuthorize, function(req, res) {
    console.log('/admin/logs Start!');
    Log.find({}, function(err, logs) {
      if (err) {
        console.log('/admin/logs', err);
        res.status(500).send(err);
      } else {
        res.send(logs);
      };
    }).sort({time: -1});
  });

  app.delete('/api/admin/log/:_id', filter.adminAuthorize, function(req, res){
    Log.remove({_id: req.params._id}, function(err, log){
      if (err){
        res.send(err);
      }else{
        res.send(log);
      };
    })
  });
};
