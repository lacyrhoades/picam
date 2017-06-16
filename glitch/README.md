Glitch meets Raspberry Pi, a simple remote control web cam
=========================

Server:

1. Edit your glitch `.env` file with some "secret key" you made up
    ````
    UPLOAD_KEY=glitchIsLikeS0c00l
    ````

Client:

1. If you don't have nodejs installed, do it:
    ````
    sudo apt-get install nvm
    nvm install stable
    ````
1. Install the picam client like so:
    ````
    npm install -g lacyrhoades/picam
    ````
1. Edit your ~/.picam file with both UPLOAD_KEY= and GLITCH_URL= like
    ````
    module.exports = {
      "GLITCH_URL": "your-remix.glitch.me",
      "UPLOAD_KEY": "somekey"
    }
    ````
1. Run the picam client:
    ````
    picam-client [verbose]
    ````
1. Bonus points for using PM2 to keep it running all the time (optional)

Hardware:

1. Install [camera module](https://www.raspberrypi.org/products/camera-module-v2/)  to Raspberry Pi (via ribbon cable)
1. Configure Wi-Fi and install Raspbian Lite
1. Change password! Type: `passwd`
1. Change root password! Type: `sudo passwd`
1. sudo touch /boot/ssh (optional, to enable SSH)
1. sudo apt-get update && sudo apt-get dist-upgrade (optional, to upgrade all software)
1. sudo raspi-config -> Enable the pi's camera module
1. Install nodejs if you don't have it already
