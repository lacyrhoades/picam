const spawn = require('child_process').spawn
const sprintf = require('sprintf-js').sprintf // for format strings
const io = require('socket.io-client')

const PiCamera = require('./picamera.js')
var config = require('./config.js')

var camera = new PiCamera()
camera.name = config.cameraName

config.hosts.forEach(function(eachHost) {
  var path = 'https://' + eachHost.host + '/pi'
  console.log('Connecting to ' + path + ' ...')
  var params = {
    'query': {
      'token': eachHost.token,
      'camera_name': camera.name
    }
  }
  var socket = io(path, params)
  setupSocket(socket)
})

function setupSocket(socket) {
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
        '-awb',
        camera.awbMode,
        '-ev',
        sprintf("%+.1f", camera.exposure * 6), // raspistill uses 1/6th stop increments
        '-sa',
        camera.saturation,
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
      ]

    if (camera.vflip) {
      args.push('-vf')
    }

    if (camera.hflip) {
      args.push('-hf')
    }

    if (config.debug) {
      console.log("Running raspistill with args:")
      console.log(args)
    }

    var child = spawn('raspistill', args)

    var stdout = Buffer.from("")

    child.on('error', function(err) {
      console.log("Error running raspistill (error)")
    })
    child.stderr.on('data', function(chunk) {
      console.log("Stderr running raspistill (stderr)")
      console.log(chunk.toString())
    })
    child.stdout.on('data', function(chunk) {
      stdout = Buffer.concat([stdout, Buffer.from(chunk)])
    })
    child.on('close', function() {
      if (stdout != null) {
        console.log("Got image, sending")
        socket.emit('image', {id: socket.id, data: stdout})
      }
    });
  });

  socket.on('getUptime', function(ack) {
    var args = []
    var child = spawn('uptime', args)

    var stdout = ""

    child.on('error', function(err) {
      console.log("Error (error)")
    })
    child.stderr.on('data', function(chunk) {
      console.log("Error (stderr)")
      console.log(chunk.toString())
    })
    child.stdout.on('data', function(chunk) {
      stdout += chunk
    })
    child.on('close', function() {
      if (stdout != null) {
        console.log("Got uptime, sending")
        ack(stdout)
      }
    })
  })
}

if (config.debug) {
  setInterval(function() {
    console.log("Exposure: " + camera.exposure)
    console.log("Vflip: " + camera.vflip)
    console.log("Hflip: " + camera.hflip)
    console.log("Effect: " + camera.effect)
    console.log("Saturation: " + camera.saturation)
    console.log("Mode: " + camera.mode)
    console.log("WB: " + camera.awbMode)
  }, 500)
}
