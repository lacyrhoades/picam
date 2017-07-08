module.exports = function (app) {
  app.get('/', function(req, res) {
    res.sendFile(rootPath('views/index.html'));
  });
  
  const fs = require('fs')
  const moment = require('moment')
  app.get('/timestamp', function(req, res) {
    fs.stat('public/latest-0.jpg', function(err, stats) {
      if (err) {
        res.sendStatus(404);
        return;
      }
      res.json({timestamp: moment(stats.mtime).fromNow()});
    });
  });
}