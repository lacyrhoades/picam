global.rootPath = function(name) {
    return __dirname + '/' + name
}

global.rootRequire = function(name) {
    return require(rootPath(name))
}

const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

const assets = rootRequire('lib/assets.js')
app.use("/assets", assets)

app.use(express.static('public'))

const PicamServer = rootRequire('lib/picam-server.js')
const picam = new PicamServer()
picam.setupRoutes(app)
picam.setupSockets(io)

var listener = server.listen(process.env.PORT, function () {
  console.log('Picam server is listening on port ' + listener.address().port);
});
