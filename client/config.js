require('dotenv').config()

var config = {hosts: []}

if (process.env.GLITCH_URL != null && process.env.UPLOAD_KEY != null) {
  config.hosts.push({host: process.env.GLITCH_URL, uploadKey: process.env.UPLOAD_KEY})
  config.cameraID = process.env.PICAM_ID;
  console.log("Loaded config from .env file");
} else {
  var homedir = require('home-dir');
  var fs = require('fs');
  try {
    config = JSON.parse(
      String(fs.readFileSync(homedir('/.picam')))
    );
    console.log("Loaded config from ~/.picam file");
  } catch (e) {
    console.log(e);
    throw new Error('invalid config at ~/.picam');
  }
}

if (config.cameraID == null || config.hosts.length == 0) {
  throw new Error('picamera-client needs at least one host and a camera ID in ~/.picam');
}

module.exports = config;
