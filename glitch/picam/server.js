const fs = require('fs'); // For writing to filesystem
const moment = require('moment'); // for showing the last "update" time on the pic
const base64 = require('base64-js'); // for injecting images into DOM
const nunjucks = require('nunjucks'); // for templating the input fields

const express = require('express');
const app = express();

const server = require('http').createServer(app);
const io = require('socket.io')(server);

const piSocket = io.of('/pi');
const browserSocket = io.of('/web');

var PiCamera = require('./picamera.js');
var camera = new PiCamera();

var assets = require('./assets');
app.use(express.static('public')); // http://expressjs.com/en/starter/static-files.html
app.use("/assets", assets);
nunjucks.configure(".", { noCache: true })
app.get('/', function(req, res) {
  res.send(
      nunjucks.render(
        'views/index.html',
        {
          'effects': PiCamera.allEffects,
          'modes': PiCamera.allModes,
          'awbModes': PiCamera.allAWBModes
        }
      )
    );
});

app.get('/timestamp', function(req, res) {
  fs.stat('public/latest.jpg', function(err, stats) {
    if (err) {
      res.sendStatus(404);
      return;
    }
    res.json({timestamp: moment(stats.mtime).fromNow()});
  });
});
  

piSocket.on('connection', function(client){
  if (client.handshake.query.upload_key != process.env.UPLOAD_KEY) {
    console.log('Rando tried to connect with key: ' + client.handshake.query.upload_key);
    return;
  }
  
  browserSocket.emit('showControls');
  
  console.log('New pi connected');
  
  client.emit('settings', camera, function(actualSettings) {
    camera.setSettings(actualSettings);
    browserSocket.emit('settings', camera.settings());
  });
  
  client.on('disconnect', function() {
    console.log('Pi disconnected');
    browserSocket.emit('hideControls');
    browserSocket.emit('hideUptime');
  });
  
  client.on('image', function (data) {
    if (data && data.length) {
      browserSocket.emit('image', 'data:image/jpeg;base64,' + data.toString('base64'));
      fs.writeFile(__dirname + "/public/latest.jpg", data, function(error) {
        console.log("Updated latest.jpg");
      });
    }
  });
});

browserSocket.on('connection', function(browser) {
  console.log('New browser connected');
  
  browser.emit('settings', camera.settings());
  
  var keys = Object.keys(piSocket.clients().connected);
  if (keys.length) {
    browser.emit('showControls');
    var firstPi = piSocket.clients().connected[keys[0]]
    firstPi.emit('getUptime', function (uptime) {
      browserSocket.emit('showUptime', uptime);
    })
  }
  
  fs.readFile(__dirname + '/public/latest.jpg', function (err, data) {
    browser.emit('image', 'data:image/jpeg;base64,' + base64.fromByteArray(data));
  });

  browser.on('exposure', function(val) {
    var clamped = Math.max(Math.min(camera.exposure + val, 4), -4);
    camera.exposure = PiCamera.validExposureValue(clamped);
    camera.exposureString = PiCamera.formatExposureString(camera.exposure);
    piSocket.emit('settings', camera.settings());
    browserSocket.emit('settings', camera.settings());
  });
  
  browser.on('vflip', function() {
    camera.vflip = camera.vflip == false;
    piSocket.emit('settings', camera.settings());
    browserSocket.emit('settings', camera.settings());
  });
  
  browser.on('hflip', function() {
    camera.hflip = camera.hflip == false;
    piSocket.emit('settings', camera.settings());
    browserSocket.emit('settings', camera.settings());
  });
  
  browser.on('effect', function(val) {
    camera.effect = PiCamera.validEffect(val);
    piSocket.emit('settings', camera.settings());
    browserSocket.emit('settings', camera.settings());
  });
  
  browser.on('mode', function(val) {
    camera.mode = PiCamera.validExposureMode(val)
    piSocket.emit('settings', camera.settings());
    browserSocket.emit('settings', camera.settings());
  });
  
  browser.on('awbMode', function(val) {
    camera.awbMode = PiCamera.validAWBMode(val);
    piSocket.emit('settings', camera.settings());
    browserSocket.emit('settings', camera.settings());
  });
  
  browser.on('snap', function() {
    piSocket.emit('snap');
    browserSocket.emit('showLoading');
  });
  
});

var listener = server.listen(process.env.PORT, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});

