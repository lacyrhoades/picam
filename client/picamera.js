const sprintf = require('sprintf-js').sprintf; // for format strings

var effects = [
  'none',
  'negative',
  'solarise',
  'sketch',
  'denoise',
  'emboss',
  'oilpaint',
  'hatch',
  'gpen',
  'pastel',
  'watercolour',
  'film',
  'blur',
  'saturation',
  'colourswap',
  'washedout',
  'posterise',
  'colourpoint',
  'colourbalance',
  'cartoon'
];

var modes = [
  'auto',
  'night',
  'nightpreview',
  'backlight',
  'spotlight',
  'sports',
  'snow',
  'beach',
  'verylong',
  'fixedfps',
  'antishake',
  'fireworks'
];

var awbValues = [
  'auto',
  'sun',
  'cloud',
  'shade',
  'tungsten',
  'fluorescent',
  'incandescent',
  'flash',
  'horizon'
];

class PiCamera {
}

PiCamera.prototype.exposure = 0;
PiCamera.prototype.saturation = 0;
PiCamera.prototype.effect = effects[0];
PiCamera.prototype.mode = modes[0];
PiCamera.prototype.awbMode = awbValues[0];
PiCamera.prototype.exposureString = "0.0";
PiCamera.prototype.saturationString = "0.0";

PiCamera.formatExposureString = function (val) {
  return sprintf("%+.1f", val);
};

PiCamera.formatSaturationString = function (val) {
  return sprintf("%+.0f", val);
};


PiCamera.allModes = modes;
PiCamera.validExposureMode = function(val) {
  if (modes.includes(val)) {
    return val;
  }
  return modes[0];
}

PiCamera.allEffects = effects;
PiCamera.validEffect = function (val) {
  if (effects.includes(val)) {
    return val;
  }
  return effects[0];
}

PiCamera.allAWBModes = awbValues;
PiCamera.validAWBMode = function (val) {
  if (awbValues.includes(val)) {
    return val;
  }
  return awbValues[0];
}

PiCamera.validSaturationValue = function (val) {
  if (isNaN(val)) {
    return 0;
  }
  return min(max(val, -100), 100);
}

PiCamera.validExposureValue = function (val) {
  if (isNaN(val)) {
    return 0;
  }
  return min(max(val, -4), 4);
}

PiCamera.prototype.setSettings = function (newSettings) {
  if (newSettings.exposure != null) {
    this.exposure = newSettings.exposure
    this.exposureString = PiCamera.formatExposureString(newSettings.exposure);
  }
  if (newSettings.vflip != null) {
    this.vflip = newSettings.vflip;
  }
  if (newSettings.hflip != null) {
    this.hflip = newSettings.hflip;
  }
  if (newSettings.effect != null) {
    this.effect = newSettings.effect;
  }
  if (newSettings.saturation != null) {
    this.saturation = newSettings.saturation;
    this.saturationString = PiCamera.formatSaturationString(newSettings.saturation);
  }
  if (newSettings.mode != null) {
    this.mode = newSettings.mode;
  }
  if (newSettings.awbMode != null) {
    this.awbMode = newSettings.awbMode;
  }
}

PiCamera.prototype.settings = function () {
  return {
    exposureString: this.exposureString,
    exposure: this.exposure,
    vflip: this.vflip,
    hflip: this.hflip,
    effect: this.effect,
    mode: this.mode,
    awbMode: this.awbMode
  };
}

module.exports = PiCamera;
