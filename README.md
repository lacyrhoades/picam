# Remote control for the Raspberry Pi camera

![web sockets across browsers][demo]

[demo]: https://media.giphy.com/media/3og0IG7UlgFjBj5sVq/giphy.gif "Demo Video"

See: picam.glitch.me

## Installation on Raspberry Pi (requires Node)

    npm install lacyrhoades/picam
    # create and edit file at ~/.picam
    ./picam-client

## Install Node first (if you need to)

    sudo apt-get install nvm
    nvm install stable

## Example ~/.picam config

    module.exports = {
      "GLITCH_URL": "your-remix.glitch.me",
      "UPLOAD_KEY": "somekey"
    }
