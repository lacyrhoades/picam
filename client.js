const spawn = require('child_process').spawn;
const sprintf = require('sprintf-js').sprintf; // for format strings
const PiCamera = require('./picamera.js');

require('./config.js');
var debug = process.argv.length > 2;

const io = require('socket.io-client');
console.log('Connecting to https://' + process.env.GLITCH_URL + '/pi...');
const socket = io('https://' + process.env.GLITCH_URL + '/pi?upload_key=' + process.env.UPLOAD_KEY);

var camera = new PiCamera();

socket.on('connect', function(){
  console.log("Connected to server");
});

socket.on('settings', function(newSettings, ack){
  camera.setSettings(newSettings);
  if (ack) {
    ack(camera);
  }
});

socket.on('disconnect', function(){
  console.log("Disconnect from server");
});

socket.on('snap', function() {
  var args = [
      '-ifx',
      camera.effect,
      '-ex',
      camera.mode,
      '-ev',
      sprintf("%+.1f", camera.exposure * 6), // raspistill uses 1/6th stop increments
      '-t',
      '1',
      '-h',
      '480',
      '-w',
      '640',
      '-br',
      '54',
      '-mm',
      'matrix',
      '-n',
      '-o',
      '-'
    ];

  if (camera.vflip) {
    args.push('-vf');
  }

  if (camera.hflip) {
    args.push('-hf');
  }

  console.log("Running raspistill with args");
  console.log(args);

  var child = spawn('raspistill', args);

  var stdout = Buffer.from("");

  child.on('error', function(err) {
    console.log("Error running raspistill (error)");
  });
  child.stderr.on('data', function(chunk) {
    console.log("Stderr running raspistill (stderr)");
    console.log(chunk.toString());
  });
  child.stdout.on('data', function(chunk) {
    stdout = Buffer.concat([stdout, Buffer.from(chunk)]);
  });
  child.on('close', function() {
    if (stdout != null) {
      console.log("Got image, sending");
      socket.emit('image', stdout);
    }
  });
});

socket.on('getUptime', function(ack) {
  var args = [];
  var child = spawn('uptime', args);

  var stdout = "";

  child.on('error', function(err) {
    console.log("Error (error)");
  });
  child.stderr.on('data', function(chunk) {
    console.log("Error (stderr)");
    console.log(chunk.toString());
  });
  child.stdout.on('data', function(chunk) {
    stdout += chunk;
  });
  child.on('close', function() {
    if (stdout != null) {
      console.log("Got uptime, sending");
      ack(stdout);
    }
  });
});

if (debug) {
  setInterval(function() {
    console.log("Exposure: " + camera.exposure);
    console.log("Vflip: " + camera.vflip);
    console.log("Hflip: " + camera.hflip);
    console.log("Effect: " + camera.effect);
    console.log("Mode: " + camera.mode);
    console.log("WB: " + camera.awbMode);
  }, 500);
}
