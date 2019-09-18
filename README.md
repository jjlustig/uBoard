# uBoard

A customizable mobile interface to control desktop mouse and keyboard commands

See our demo: https://www.youtube.com/watch?v=86RU1N75gOM&feature=youtu.be

# Setup

Open your mobile browser by scanning the QRCode or enter the URL, then you are able to control your desktop via browser.


## Installation


To run the uBoard server you must have the following installed: 
1. nodejs (7.5 or above)
2. npm (5.6.0 or above)
3. bower (1.8.2 or above)

Get required packages

```
$ npm install
```

This will run `bower install` and install client side libraries into `public/vendor` 

After, run

```
$ node server.js
```

To host the uBoard server on the desktop.

Next, locate your desktop network IP address. To access the mobile component, open a web browser on a mobile device 
and navigate to the IP address of your computer, port 8000

If you are running the desktop executable, you can scan the qr code which will contain the same address

Make sure your mobile device and desktop are running on the same router

## Code structure

The server uses `server.js` and the `socket.io` to change the mouse position and receive keyboard input 

The desktop uses `desktop.html` to display the QR code on the desktop window. (NOT FULLY IMPLEMENTED YET)

For the client side, a mobile device will receive `index.html` and its attached `client.js`. 
This allows the User to input the keyboard (bottom half of screen) or move the mouse (top half of screen) and emit a WebSocket signal to the server.

## Usage Guide

### Touchpad

The touchpad portion of the interface allows for the following mouse gestures.
* **[Desktop input - Touchpad gesture]**
* Left click - Single one finger tap
* Right click - Single two finger tap
* Double click - Double one finger tap
* Mouse movement - One finger drag
* Scrolling - Two finger drag
* Drag and Drop - Three finger drag

### Keyboard

On tapping buttons on the keyboard, the keys should be typed on your desktop

The following special character keys are current placeholders for utility keys

* @ - Enter
* # - Space
* * - Backspace

The placement and content of the keys can be manipulated by turning on the 'Movable' toggle in the navigation bar.

Once in edit mode, you can drag and drop the placement of keys to change their position. 
You can also hold down on a key to update the string content of the key, and save the
current placement and content of the key.

Once saved, anytime you run the application from your current desktop, the mobile
device will load the keyboard layout you set.

## Additional Setup

Additionally your desktop will need to have the appropriate c++ and python libraries

python2 is required to run the robotjs library. Xcode c++ libraries are required to compile robotjs

To install the required c++ Libraries:

On Mac, run

```
xcode-select --install
```

On windows, (TODO)

```
TODO: Fill this in
```

### Building Executable

Clear packages and update to nodejs version 9.x.x

```
$ rm -rf node_modules
$ rm -rf public/vendor
$ nvm install 9
```

Install nwjs and builder

```
$ npm install -g nwjs
$ npm install nwjs-builder-phoenix --save-dev

```
Create executable (dist for all platforms, dist-mac for just macOS)

```
$ npm run dist(-mac)
```

Run app from exe (runs macOS version)

```
$ npm start
```


