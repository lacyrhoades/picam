class PicamServer {
  constructor () {
    this.cameraIDs = []
  }
}

PicamServer.prototype.setupRoutes = require('./picam-server/routes.js')
PicamServer.prototype.setupSockets = require('./picam-server/sockets.js')

module.exports = PicamServer
