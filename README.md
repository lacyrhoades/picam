# Remote control for the Raspberry Pi camera

![web sockets across browsers][demo]

[demo]: https://media.giphy.com/media/3og0IG7UlgFjBj5sVq/giphy.gif "Demo Video"

See: picam.glitch.me

## Installation on Raspberry Pi

    sudo apt-get install nvm
    nvm install stable
    npm install lacyrhoades/picam
    # edit ~/.picam
    ./picam-client

## Example ~/.picam config

    module.exports = {
      "GLITCH_URL": "your-remix.glitch.me",
      "UPLOAD_KEY": "somekey"
    }