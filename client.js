require('dotenv').config()
const spawn = require('child_process').spawn;

const io = require('socket.io-client');
const socket = io('https://' + process.env.GLITCH_URL + '/pi?upload_key=' + process.env.UPLOAD_KEY);
var debug = process.argv.length > 2;

var camera = {
  settings: {
    exposure: 0.0,
    effect: "none",
    vflip: false,
    mode: "off"
  }
};

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
  if (data.mode != null) {
    camera.settings.mode = data.mode;
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
      '-ex',
      camera.settings.mode,
      '-ev',
      camera.settings.exposure * 6, // raspistill uses 1/6th stop increments
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

  if (camera.settings.vflip) {
    args.push('-vf');
  }

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
      console.log("Got image, sending back to socket");
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
      console.log("Got uptime, sending back to socket");
      ack(stdout);
    }
  });
});

if (debug) {
  setInterval(function() {
    console.log("Exposure: " + camera.settings.exposure);
    console.log("Vflip: " + camera.settings.vflip);
    console.log("Effect: " + camera.settings.effect);
    console.log("Mode: " + camera.settings.mode);
  }, 500);
}
