require('dotenv').config()

var key = process.argv[2];

if (isNaN(key)) {
  key = false;
}

if (key && (process.env.GLITCH_URL == null || process.env.UPLOAD_KEY == null)) {
  var homedir = require('home-dir');
  try {
    var config = require(homedir('/.picam'))[key];
    process.env.GLITCH_URL = config.GLITCH_URL;
    process.env.UPLOAD_KEY = config.UPLOAD_KEY;
    process.env.PICAM_ID = config.PICAM_ID;
    console.log("Loaded config from ~/.picam file");
  } catch (e) {
    console.log(e);
    throw new Error('picamera-client needs a string for GLITCH_URL and UPLOAD_KEY in ~/.picam');
  }
} else {
  console.log("Loaded config from .env file");
}

if (process.env.GLITCH_URL == null || process.env.UPLOAD_KEY == null) {
  throw new Error('picamera-client needs a string for GLITCH_URL and UPLOAD_KEY in ~/.picam');
}
