const spawn = require('child_process').spawn;

const io = require('socket.io-client');
const socket = io('https://picam-dev.glitch.me/pi');

var debug = process.argv.length > 2;
var camera = {settings: {exposure: 0.0, effect: "none", vflip: false}};

socket.on('connect', function(){
  console.log("Connected to server");
});

socket.on('settings', function(data, ack){
  if (data.exposure != null) {
    camera.settings.exposure = data.exposure
  }
  if (data.vflip != null) {
    camera.settings.vflip = data.vflip;
  }
  if (data.effect != null) {
    camera.settings.effect = data.effect;
  }
  if (ack) {
    ack(camera.settings);
  }
});

socket.on('disconnect', function(){
  console.log("Disconnect from server");
});

socket.on('snap', function() {
  var args = [
      '-ifx',
      camera.settings.effect,
      '-t',
      '1',
      '-h',
      '480',
      '-w',
      '640',
      '-ev',
      camera.settings.exposure * 12,
      '-br',
      '55',
      '-mm',
      'matrix',
      '-n',
      '-o',
      '-'
    ];

  if (camera.settings.vflip) {
    args.push('-vf');
  }

  var child = spawn(
    'raspistill', args
  );

  var stdout = Buffer.from("");
  child.on('error', function(err) {
    console.log("Error running raspistill (error)");
  });
  child.stderr.on('data', function(chunk) {
    console.log("Stderr running raspistill (stderr)");
  });
  child.stdout.on('data', function(chunk) {
    stdout = Buffer.concat([stdout, Buffer.from(chunk)]);
  });
  child.on('close', function() {
    if (stdout != null) {
      socket.emit('image', stdout);
    }
  });
});

if (debug) {
  setInterval(function() {
    console.log("Exposure: " + camera.settings.exposure);
    console.log("Vflip: " + camera.settings.vflip);
    console.log("Effect: " + camera.settings.effect);
  }, 500);
}
