'use strict';


//-------External Libraries----------//
var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var robot = require('robotjs');
var config = require('./public/js/config.js');
var url = require("opn");
var fs = require("fs");
var readline = require("readline");
config.passcode = ''

//---------GLOBAL STATE VARIABLES ----// 
var screenWidth = 1440;
var screenHeight = 900;
var adjustment = 2;
var mouse = null;
var newX = null;
var newY = null;


// Get screen size from NW desktop
try {
  var gui = window.require('nw.gui');
  gui.Screen.Init();
  var screens = gui.Screen.screens;
  // XXX: currently only take first screen
  var rect = screens[0].bounds;
  screenWidth = rect.width;
  screenHeight = rect.height;
} catch (e) {
  console.log(e);
}


//-------WEB SERVER FUNCTIONALITY -------// 
//Purpose: Sends client information when making http request to main entrypoint
app.get('/', function(req, res) {
  res.sendFile(__dirname + '/public/client.html');
});


//Purpose: use the public directory to send information
app.use('/public', express.static('public'));

//Purpose: Lets the webserver listen for requests on port 8000
var PORT = 8000;
http.listen(PORT, function() {
  console.log('listening on *:' + PORT);
});


//-------MOBILE MOUSE FUNCTIONALITY -------// 

//General Connection Configuration
io.on('connection', function(socket) {
  socket.broadcast.emit('hi');
  console.log('a user connected');
  socket.on('disconnect', function() {
    console.log('user disconnected');
  });

  var keys = []
  var xpos = []
  var ypos = []

  //Load default keyboard
  var file = fs.readFileSync("configuration.json")  
  var content = JSON.parse(file)

  for (var key in content) {
    keys.push(content[key][0]);
    xpos.push(content[key][1]);
    ypos.push(content[key][2]);
  }
  socket.emit('updateKeys', {k: keys, x: xpos, y: ypos});

   content = []
  //Load default numpad
  var file = fs.readFileSync("numpad.json")  
  var content = JSON.parse(file)

  var keys = []
  var xpos = []
  var ypos = []

  for (var key in content) {
    keys.push(content[key][0]);
    xpos.push(content[key][1]);
    ypos.push(content[key][2]);
  }
  socket.emit('updateNumPad', {k: keys, x: xpos, y: ypos});
   
  content = []
  //Load default urls
  var file = fs.readFileSync("url.json")  
  content = JSON.parse(file)
  
  var keys = []
  var xpos = []
  var ypos = []
  
  for (var key in content) {
    keys.push(content[key][0]);
    xpos.push(content[key][1]);
    ypos.push(content[key][2]);
  }
  socket.emit('updateUrls', {k: keys, x: xpos, y: ypos});

  //Load custom keyboards
  var lineReader = require('readline').createInterface({
    input: require('fs').createReadStream('./custom_configs/order')
  });

  lineReader.on('line', function (line) {
    var file = fs.readFileSync('./custom_configs/'+line)  
    content = JSON.parse(file)
      var keys = []
      var xpos = []
      var ypos = []
      var altText = []

      
      for (var key in content) {
        keys.push(content[key][0]);
        xpos.push(content[key][1]);
        ypos.push(content[key][2]);
        altText.push(content[key][3]);
      }
      socket.emit('updateCustom', {fname: line.slice(6,-5), k: keys, x: xpos, y: ypos, altText:altText});
    });

  //Keyboard Functionality
  socket.on('string', function(pos) {
    console.log(config.passcode)
    if (pos.pw || config.passcode) {
      if (config.passcode !== pos.pw) { //Password Checker
        return;
      }
    }

    console.log("Trying to type")
    console.log(pos.str.text);
    if(pos.str.text.length === 1 && pos.str.moddifier != "None"){
      robot.keyTap(pos.str.text, pos.str.moddifier)
    }
    else{
      robot.typeString(pos.str.text);
    }
  });
 
  socket.on('functionality', function(pos) {
    if (pos.pw || config.passcode) {
      if (config.passcode !== pos.pw) { //Password Checker
        return;
      }
    }
    var type = pos.type
    console.log(type);
    switch (type) {
      case 'backspace':
        robot.keyTap('backspace');
        break;
      case 'enter':
        robot.keyTap('enter');
        break;
      case 'ArrowUp':
        robot.keyTap('up');
        break;
      case 'ArrowDown':
        robot.keyTap('down');
        break;
      case 'ArrowLeft':
        robot.keyTap('left');
        break;
      case 'ArrowRight':
        robot.keyTap('right');
        break;
      case 'space':
        robot.keyTap('space');
        break;
    }
  });   
  
  socket.on('text', function(pos) {
    if (pos.pw || config.passcode) {
      if (config.passcode !== pos.pw) { //Password Checker
        return;
      }
    }

    console.log('Typing ' + pos.text);
    robot.typeString(pos.text);
  });

  socket.on('saveKey', function(key) {
    if (key.pw || config.passcode) {
      if (config.passcode !== key.pw) { //Password Checker
        return;
      }
    }

    console.log(key.index.toString())
    var file = fs.readFileSync("./custom_configs/custom" + key.index + ".json")  
    var configuration = JSON.parse(file)
    configuration[key.id] = [key.val, key.x, key.y, key.altText];
    fs.writeFile("./custom_configs/custom" + key.index.toString() + ".json", JSON.stringify(configuration, null, 4), 'utf8', error=>{});
  });

  socket.on('newBoard', function(key) {
    fs.appendFile('./custom_configs/order', 'custom'+key.id+'.json\n') 
    fs.writeFile('./custom_configs/custom'+key.id+'.json', JSON.stringify({}, null, 4), 'utf8', error=>{})
  });

  socket.on('deleteBoard', function(key) {
    fs.readFile('./custom_configs/order', 'utf8', function(err, data)
    {
        var linesExceptDel = data.split('\n');
        var findline = linesExceptDel.findIndex(function(ele){
          return ele == 'custom' + key.id + '.json'
        })
        var begin = linesExceptDel.slice(0,findline).join('\n')
        var end = linesExceptDel.slice(findline+1).join('\n')
        console.log(begin)
        console.log(end)
        begin = begin + end
        fs.writeFile('./custom_configs/order', begin)
    });
  });

  socket.on('url', function(pos) {
    if (pos.pw || config.passcode) {
      if (config.passcode !== pos.pw) { //Password Checker
        return;
      }
    }

    console.log("Trying to open url")
    console.log(pos.str)
    url(pos.str)
  });


  //Mouse Functionality
  socket.on('mouse', function(pos) {
    if (pos.pw || config.passcode) {
      if (config.passcode !== pos.pw) { //Password Checker
        return;
      }
    }
    if (pos.cmd == 'move')  {
      mouse = robot.getMousePos(); //Get mouse state
      newX = mouse.x + pos.x * adjustment;
      newY = mouse.y + pos.y * adjustment;
      robot.moveMouse(newX, newY);
      mouse = robot.getMousePos(); //Update mouse state
    }
    else if (pos.cmd == 'scroll'){
      mouse = robot.getMousePos(); //Get mouse state
      robot.scrollMouse(pos.x*5, pos.y*5);
      mouse = robot.getMousePos(); //Update mouse state
    }
    else if (pos.cmd == 'drag') {
      mouse = robot.getMousePos(); //Get mouse state
      newX = mouse.x + pos.x * adjustment;
      newY = mouse.y + pos.y * adjustment;
      robot.dragMouse(newX, newY);
      mouse = robot.getMousePos(); //Update mouse state
    } 
    else if (pos.cmd == 'click') {
      robot.mouseClick();
    } else if (pos.cmd == 'rightclick') {
      robot.mouseClick('right');
    } else if (pos.cmd == 'scrollstart') {
      //robot.mouseToggle('down', 'middle');
    } else if (pos.cmd == 'scrollend') {
      //robot.mouseToggle('up', 'middle');
    } else if (pos.cmd == 'dragstart') {
      robot.mouseToggle('down', 'left');
    } else if (pos.cmd == 'dragend') {
      robot.mouseToggle('up', 'left');
    } else if (pos.cmd == 'right') {
      robot.keyTap("right");
    } else if (pos.cmd == 'left') {
      robot.keyTap("left");
    } else if (pos.cmd == 'doubleclick') {
      robot.mouseClick("left",true);
    }
  });
});



