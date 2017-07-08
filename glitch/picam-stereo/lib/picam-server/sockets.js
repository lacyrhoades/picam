module.exports = function (io) {
  this.piSocket = io.of('/pi')
  this.browserSocket = io.of('/web')
  
  var self = this
  
  self.piSocket.on('connection', function(client) {
    client.on('disconnect', function() {
      console.log('Pi disconnected');
      self.browserSocket.emit('hideControls');
    });
  
    if (client.handshake.query.upload_key != process.env.UPLOAD_KEY) {
      console.log('Rando tried to connect with key: ' + client.handshake.query.upload_key);
      client.disconnect();
      return;
    }
  
    var keys = Object.keys(self.piSocket.clients().connected);
    
    if (keys.length == 2) {
      self.browserSocket.emit('showControls');
    } else {
      self.browserSocket.emit('hideControls');
    }

    console.log('New pi connected!');
  
    client.on('image', function (data, info) {
      if (self.cameraIDs.includes(data.id) == false) {
        self.cameraIDs.push(data.id);
      }
      
      if (data.id && data.data && data.data.length) {
        var index = self.cameraIDs.findIndex(function (eachID) {
          return eachID == data.id;
        });
        
        if (index != -1) {
          self.browserSocket.emit('image', {index: index, data: 'data:image/jpeg;base64,' + data.data.toString('base64')});
          var filename = "latest" + index + ".jpg"
          fs.writeFile(rootPath("public/" + filename), data.data, function(error) {
            console.log("Updated " + filename);
          });
        } else {
          console.log("unknown ID: " + data.id)
        }
      }
    });  
  });
  
  const fs = require('fs')
  
  self.browserSocket.on('connection', function(browser) {
    console.log('New browser connected');
  
    var keys = Object.keys(self.piSocket.clients().connected);
    if (keys.length == 2) {
      browser.emit('showControls');
    } else {
      browser.emit('hideControls');
    }
  
    
    fs.readFile(rootPath('public/latest0.jpg'), function (err, data) {
      self.browserSocket.emit('image', {index: 0, data: 'data:image/jpeg;base64,' + data.toString('base64')});
    });
  
    fs.readFile(rootPath('public/latest1.jpg'), function (err, data) {
      self.browserSocket.emit('image', {index: 1, data: 'data:image/jpeg;base64,' + data.toString('base64')});
    });
    
    browser.on('snap', function() {
      self.piSocket.emit('snap');
      self.browserSocket.emit('showLoading');
    });

  });

}
