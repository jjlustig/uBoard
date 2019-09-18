/* jshint node: true */
/* global io, Hammer, $ */
'use strict';


//-----GLOBAL STATE VARIABLES-----//
var socket = io();
var move = false; //Toggles moving functionality
var updateKey; // Modal overlay
var settingsModal = document.getElementById('myModal');// Modal textbox
var editModal = document.getElementById('edit-modal');// Modal textbox
var inputModal = document.getElementById('inputText');
var altText = document.getElementById('altText');
var newBoardModal = document.getElementById('newBoard-modal');// New Board Naming Modal
var newBoardModalInput = document.getElementById('inputBoardName');// New Board Naming Modal
var keyboardWidth = document.getElementById('keyboard').offsetWidth;// Width pixel of display
var keyboardHeight = document.getElementById('keyboard').offsetHeight;// Height pixel of
//$("#touchpad").hide();

function onendListener (event) { 
        var updateKey = event.target;
        var newX = parseInt(updateKey.style.left) + updateKey.getAttribute('data-x')/keyboardWidth*100
        var newY = parseInt(updateKey.style.top) + updateKey.getAttribute('data-y')/keyboardHeight*100
        newX = parseInt(newX)
        newY = parseInt(newY)
        newX = Math.min(Math.max(0, newX),100).toString()
        newY = Math.min(Math.max(0, newY),100).toString()
        $("#"+updateKey.id).css({'width': 'auto'})
        socket.emit('saveKey', {
          index: $('#customSelect option:selected').attr('id').slice(7),
          id: updateKey.id,
          val: updateKey.innerText,
          altText: altText, 
          x: newX,
          y: newY });
  }

var draggableSettings = {
    snap: {
      targets: [
          interact.createSnapGrid({ x: .05*keyboardWidth, y: .1*keyboardHeight })
        ],
      range: Infinity
    },
    inertia: true,      // enable inertial throwing
    restrict: {
      restriction: "parent", // keep the element within the area of it's parent
      endOnly: true,
      elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
    },
      autoScroll: true, // enable autoScroll
      onmove: dragMoveListener // call this function on every dragmove event
      //onend: onendListener This is a bit buggy
    };

function isUrl(s) {
   var regexp = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/
   return regexp.test(s);
}

/*
-----------SETTINGS MODAL---------------
*/

var customButtonCounts = {};
var move = false;



$('#new-keyboard').click(function() {
  newBoardModal.style.display = "block";
});

$('#newBoard-save').click(function() {

  var newBoardName = newBoardModalInput.value
  if (newBoardName.indexOf(" ") != -1){
    newBoardName = newBoardName.split(' ').join('_')
  }
  if(newBoardModalInput.value === "") {
    return
  }

  var boardIds = $('#customSelect').children()
  console.log(boardIds)
  for(var i = 0; i < boardIds.length; i++){
    console.log(boardIds[i].innerText)
    console.log(newBoardName)
    if (boardIds[i].innerText.trim() === newBoardName.trim()){
      //Should give some warning of there is a match
      console.log("found match")
      console.log(boardIds[i].innerText)
      console.log(newBoardName)
      return
    }
  }


  $('#customSelect').append('<option class = "select-item" id = "select-' + newBoardName + '">' + newBoardName + ' </option>')
  $('#edit-wrapper').show();
  $('#add-key').show();
  $('#delete-keyboard').show();
  var newSlide ='<div class = "custom swiper-slide swiper-slide-inner" id="custom-' + newBoardName + '">  </div>';
  $('#s'+swiper.activeIndex.toString()).css("background-color", "turquoise")
  $('#s4').css("background-color", "green")
  swiperInner.appendSlide(newSlide)
  swiper.slideTo(4, 200, false);
  console.log(swiperInner)
  console.log(swiperInner.slides.length)
  swiperInner.slideTo(swiperInner.slides.length-1, 200, false);
  customButtonCounts['custom-' + newBoardName] = 0

  socket.emit('newBoard', {
    id: newBoardName});
  $('#select-' + newBoardName).prop("selected", true)
  newBoardModal.style.display = "none";
});


$('#add-key').click(function() {
  var newButtonId = 'custom-key-' + $('#customSelect option:selected').attr('id').slice(7) + "-" + (customButtonCounts['custom-' + $('#customSelect option:selected').attr('id').slice(7)]);
  $('#custom-' + $('#customSelect option:selected').attr('id').slice(7)).append('<button class = "custom-key draggable key-button" id="' + newButtonId + '"></button>');
  if(move == false){
    $('#'+newButtonId).addClass('activestyle');
  }
  var ele = $('#'+newButtonId)
  interact('#'+newButtonId).draggable(draggableSettings);
  customButtonCounts['custom-' + $('#customSelect option:selected').attr('id').slice(7)] += 1;
  ele.text('')
  console.log((keyboardWidth*.02).toString())
  ele.css({position:'absolute', left:'0%', top: '0%', minHeight: (keyboardWidth*.02).toString() + "px"});
  socket.emit('saveKey', {
    index: $('#customSelect option:selected').attr('id').slice(7),
    id: newButtonId,
    val: '', 
    x: "0",
    y: "0" });
  updateKey = ele[0]
  console.log(ele)
  inputModal.value = ''
  editModal.style.display = "block"; 
});

$('#delete-keyboard').click(function() {
  if(swiperInner.slides.length != 0){
    socket.emit('deleteBoard', {
      id: $('#customSelect option:selected').attr('id').slice(7)});
    swiperInner.removeSlide(swiperInner.activeIndex)
    $('#' + $('#customSelect option:selected').attr('id')).remove()
  }
})

$('#edit-toggle').change(function(event) {
  console.log(event.target)
  if(move){
    $('#new-keyboard').show();
    $('#delete-keyboard').show();
    $('.custom').css({'background-color': 'white'});
    $('.custom-key').addClass('activestyle');
    move = false;
  } else{
    $('#new-keyboard').hide();
    $('#delete-keyboard').hide();
    $('.custom').css({'background-color': 'rgba(250,50,50,.5)'});
    $('.custom-key').removeClass('activestyle');
    move = true;
  }
});

$('.close').click(function() {
    settingsModal.style.display = "none";
    newBoardModal.style.display = "none";
});

$('#modal-close').click(function() {
    editModal.style.display = "none";
    newBoardModal.style.display = "none";
});



/*
-----------SWIPING FUNCTIONALITY---------------
*/

var swiper = new Swiper('.swiper-container', {
  });
  
swiper.on("transitionStart", function() {
    move = true;
})
swiper.on("transitionEnd", function() {
    move = false;
})
var swiperInner = new Swiper('.swiper-container-inner', {
  direction: 'vertical',
  });

swiper.allowTouchMove = false;
swiperInner.allowTouchMove = false;

var swipeIndex = 0;
$('#s0').css("background-color", "green")

var mousePos = true;

$('.icon-selection').click(function() {
  if (this.id == 'swap') {
    if (mousePos){
      $('#touchpad').insertBefore('.swiper-container');
      mousePos = false;
    } 
    else {
      $('.swiper-container').insertBefore('#touchpad');
      mousePos = true;
    }
    return;
  }

  if (this.id == 'settings-select') {
    // Bring up setting menu
    settingsModal.style.display = "block";
    if (swiper.activeIndex != 4){
      $('#edit-wrapper').hide();
      $('#add-key').hide();
      $('#delete-keyboard').hide();
    } else{
      $('#edit-wrapper').show();
      $('#add-key').show();
      $('#delete-keyboard').show();
    }
    return;
  }
  if(!move){

    var newId = parseInt(this.id[1])
    if (newId == swipeIndex) {
      return;
    }
    console.log(newId)
    console.log(swipeIndex)
    $('#s'+swipeIndex.toString()).css("background-color", "turquoise")
    $(this).css("background-color", "green")
    swipeIndex = newId;
    swiper.slideTo(newId, 200, false);
  }
});

$('#customSelect').change(function() {
  console.log($('#customSelect option:selected').index())
  swiperInner.slideTo($('#customSelect option:selected').index())
})

//-----LOADING KEYBOARDS-----//

function hotkeyStylize(ele, page, id, url){
  ele.css({'max-width': '20%', 'min-width': '20%', 'text-indent': '-9999px', 'text-align': 'left', 'overflow': 'hidden'});
  ele.append('<button class="url-icon" id="url-icon-' + id +'"> </button>')
  var urlIcon = $('#url-icon-' + id)
  try { 
    var favicon_url = getFavicon(url);
  }
  catch(err) {
    var favicon_url = ''
  }
  urlIcon.css({position: 'absolute', left: '35%', bottom: '20%', width: '30%', height: '60%', background: 'url(' + favicon_url + ')', 'background-size': 'contain', 'border-radius': '0px', border:'0px', 'background-repeat': 'no-repeat'});
}

function hotkeyDestylize(ele, page, id, url){
  $('#url-icon-' + id).remove();
  ele.css({'max-width': '100%', 'min-width': '1%', width: 'auto', 'text-indent': '0px', 'font-size': '16px'});
}

function altTextStylize(ele,text,id){
  ele.css({'width':'auto','text-indent': '-9999px', 'text-align': 'left', 'overflow': 'hidden','display': 'flex', 'font-size': '0px'});
  ele.append('<button class="alt-button" id="url-icon-' + id +'"> ' + text + '</button>')
}

function addHotkey(xpos, ypos, url, page, id){
  $('#'+page).append('<button class = "draggable activestyle url-button" id='+ id +'>' + url + '</button>');
  var ele = $('#' + id)
  ele.text(url)
  ele.css({position:'absolute', left:xpos + '%', top:ypos + '%', minHeight: (keyboardWidth*.02).toString() + "px", width: '20%'});
  hotkeyStylize(ele, page, id, url)
}

//Purpose: Receives information from the server to update the presentation of the keys on the client
socket.on('updateKeys', function(newVals) {
  console.log(newVals);
    for (var i = 0; i < newVals.x.length; i++){
      //special case 
      $('#keyboard').append('<button class = "draggable activestyle key-button" id="button' + (i+1).toString() + '">' + newVals.k[i] + '</button>');
      var ele = $('#button' + (i+1).toString())
      ele.text(newVals.k[i])
      ele.css({position:'absolute', left:newVals.x[i] + '%', top:(newVals.y[i]) + '%', minHeight: (keyboardWidth*.02).toString() + "px"});
    }
    $('#loading').hide();
  });

//Purpose: Receives information from the server to update the presentation of the keys on the client
socket.on('updateUrls', function(newVals) {
  console.log(newVals);
    for (var i = 0; i < newVals.x.length; i++){
      addHotkey(newVals.x[i], newVals.y[i], newVals.k[i], 'hotkeys', 'hotkeys-button' + (i+1).toString())
    }
  });

//Purpose: Receives information from the server to update the presentation of the keys on the client
socket.on('updateNumPad', function(newVals) {
  console.log(newVals);
    for (var i = 0; i < newVals.x.length; i++){
      $('#numpad').append('<button class = "draggable activestyle key-button" id="pad' + (i+1).toString() + '">' + newVals.k[i] + '</button>');
      var ele = $('#pad' + (i+1).toString())
      ele.text(newVals.k[i])
      ele.css({position:'absolute', left:newVals.x[i] + '%', top:(newVals.y[i]) + '%', minHeight: (keyboardWidth*.02).toString() + "px"});

    }
  });

//Purpose: Receives information from the server to update the presentation of the keys on the client
socket.on('updateCustom', function(newVals) {
  console.log(newVals);
  var newSlide ='<div class = "custom swiper-slide swiper-slide-inner" id="custom-' + newVals.fname + '">  </div>';
  $('#customSelect').append('<option class = "select-item" id= "select-' + newVals.fname + '">' + newVals.fname + '</option>')
  swiperInner.appendSlide(newSlide)
  
  for (var i = 0; i < newVals.x.length; i++){
    $('#custom-' + newVals.fname).append('<button class = "custom-key draggable activestyle" id="custom-key-' + newVals.fname + "-" + (i).toString() + '"></button>');
    var ele = $('#custom-key-' + newVals.fname + "-" + (i).toString())
    ele.text(newVals.k[i])
    ele.css({width:'auto', left:newVals.x[i] + '%', top:(newVals.y[i]) + '%', minHeight: (keyboardWidth*.02).toString() + "px"});
    
    if(!isUrl(newVals.k[i])){
      ele.addClass('key-button')
    } else{
      ele.addClass('url-button')
      hotkeyDestylize(ele, 'custom-' + newVals.fname, 'custom-key-' + newVals.fname + "-" + (i).toString(), newVals.k[i])
      hotkeyStylize(ele, 'custom-' + newVals.fname, 'custom-key-' + newVals.fname + "-" + (i).toString(), newVals.k[i])
    }

    if (newVals.altText[i]){
        hotkeyDestylize(ele, 'custom-' + newVals.fname, 'custom-key-' + newVals.fname + "-" + (i).toString(), newVals.k[i]);
        altTextStylize(ele,newVals.altText[i],'custom-key-' + newVals.fname + "-" + (i).toString());
      }
  }
  customButtonCounts['custom-' + newVals.fname] = newVals.x.length;
  $('#loading').html('');

});



/*
-----------KEYBOARD CONTROLS---------------
The Following Functions Control the KEYBOARD FUNCTIONALITY
*/

var moddifier = "None"

//Purpose: Emits the key of keyboard upon click
var emitKey = function(str) {
   pos = {'str':str,'pw':passcode}

    if (move === false){
      socket.emit('string',pos);
      console.log(pos);
    }
};

var emitUrl = function(str) {
  pos = {'str':str,'pw':passcode}
    if (move === false){
      console.log(str);
      socket.emit('url', pos);
    }
};

interact('.custom-key').draggable(draggableSettings);

var emitText = function(text) {
  pos = {'text':text,'pw':passcode}
  if (move === false){
    console.log(text);
    socket.emit('text', pos);
  }
};

$( "#textfield" ).keydown(function(event) {
  if (event.key === 'Enter') { // enter
    emitText(document.getElementById('textfield').value);
    event.preventDefault();
    if (document.getElementById('textfield').value === '') {
      socket.emit('functionality', {'pw':passcode, type:'enter'});
    }

    document.getElementById('textfield').value = '';
  }
  else if (event.key === 'Backspace' && document.getElementById('textfield').value === "") { // backspace
    socket.emit('functionality', {'pw':passcode, type:'backspace'});
  }
  else if (event.key.startsWith('Arrow') && document.getElementById('textfield').value === "") { // arrow keys
    socket.emit('functionality', {'pw':passcode, type: event.key});
  }
  else if (event.keyCode === 32 && document.getElementById('textfield').value === '') { // space
    socket.emit('functionality', {'pw':passcode, type: 'Space'});
    document.getElementById('textfield').value = '';    
  }
});

//Purpose: Uses interact.js library to enable keys to move around
interact('.custom-key').draggable({
    snap: {
      targets: [
          interact.createSnapGrid({ x: .05*keyboardWidth, y: .1*keyboardHeight })
        ],
      range: Infinity
    },
    inertia: true,      // enable inertial throwing
    restrict: {
      restriction: "parent", // keep the element within the area of it's parent
      endOnly: true,
      elementRect: { top: 0, left: 0, bottom: 1, right: 1 }
    },
      autoScroll: true, // enable autoScroll
      onmove: dragMoveListener // call this function on every dragmove event
      //onend: onendListener // THIS IS BUGGY, disabling for now
    });

function dragMoveListener (event) {
  if (move === true){
  var target = event.target,
      // keep the dragged position in the data-x/data-y attributes
      x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx,
      y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;
  // translate the element
  target.style.webkitTransform =
  target.style.transform =
    'translate(' + x + 'px, ' + y + 'px)';
  // update the posiion attributes
  target.setAttribute('data-x', x);
  target.setAttribute('data-y', y);
  }
}

//Purpose: Event listener on tapping the keys
interact('.static-key').on('tap', function (event) {
  if (event.target.id === 'go-toggle') { // enter
    socket.emit('functionality', {'pw':passcode, type: 'enter'});
  }
  else if (event.target.id === 'backspace') { // backspace
    socket.emit('functionality', {'pw':passcode, type: 'backspace'});
  }
  else if (event.target.id === 'spacebar') { // backspace
    socket.emit('functionality', {'pw':passcode, type: 'space'});
  }
  else if(event.target.id === 'shift-toggle'){
    if(moddifier == 'shift'){
      moddifier = 'None'
      $('#shift-toggle').removeClass('static-key-selected')
      $('#shift-toggle').addClass('static-key-default')
    }
    else{
      moddifier = 'shift'
      $('#shift-toggle').removeClass('static-key-default')
      $('#shift-toggle').addClass('static-key-selected')
      $('#ctrl-toggle').removeClass('static-key-selected')
      $('#ctrl-toggle').addClass('static-key-default')
    }
  }
  
  else if(event.target.id === 'ctrl-toggle'){
    if(moddifier == 'command'){
      moddifier = 'None'
      $('#ctrl-toggle').removeClass('static-key-selected')
      $('#ctrl-toggle').addClass('static-key-default')
    }
    else{
      moddifier = 'command'
      $('#ctrl-toggle').removeClass('static-key-default')
      $('#ctrl-toggle').addClass('static-key-selected')
      $('#shift-toggle').removeClass('static-key-selected')
      $('#shift-toggle').addClass('static-key-default')
    }
  }

  })

interact('.custom-key').on('doubletap', function (event) { 
    if (move == true){
      editModal.style.display = "block"; //Allows the modal to be displayed to User
      updateKey = event.target
      if(event.target.id.indexOf("url-icon") != -1){
        inputModal.value = $("#" + event.target.id).parent().clone().children().remove().end().text().trim()
        altText.value = updateKey.innerText;//updateKey.innerText
        updateKey = updateKey.parentNode
      }
      else if(event.target.hasChildNodes()){
        inputModal.value = $("#" + event.target.id).clone().children().remove().end().text().trim()
        //console.log($("#" + event.target.id));
        altText.value = $("#" + event.target.id).children()[0].innerText;//updateKey.innerText
      }
      else{
        inputModal.value = updateKey.innerText
      }

    }
});

interact('.key-button').on('tap', function (event) {

    if (event.target.id.indexOf("url-icon") != -1){
        emitKey({text: $("#" + event.target.id).parent().clone().children().remove().end().text().trim(), moddifier: moddifier})
    }
    else if(event.target.hasChildNodes()){
        emitKey({text: $("#" + event.target.id).clone().children().remove().end().text().trim(), moddifier: moddifier})
    }
    else{
      emitKey({text: event.target.innerText, moddifier: moddifier});
    }
  });

interact('.url-button').on('tap', function (event) {
    if(event.target.id.indexOf("url-icon") != -1){
      console.log("Parent")
      emitUrl($("#" + event.target.id).parent().clone().children().remove().end().text().trim())
    }
    else{
      console.log("Error")
      emitUrl($("#" + event.target.id).clone().children().remove().end().text().trim());
    }
  });

//Purpose: Updates button with textbox value
$('#modal-save').click(function() {
  var newX = parseInt(updateKey.style.left) + updateKey.getAttribute('data-x')/keyboardWidth*100
  var newY = parseInt(updateKey.style.top) + updateKey.getAttribute('data-y')/keyboardHeight*100
  newX = parseInt(newX)
  newY = parseInt(newY)
  newX = Math.min(Math.max(0, newX),100).toString()
  newY = Math.min(Math.max(0, newY),100).toString()
  console.log(newX, newY)
  updateKey.innerText = inputModal.value;
  var ele = $("#"+updateKey.id);
  console.log(updateKey)
  console.log(updateKey.innerText)
  console.log(inputModal.value)
  console.log($("#"+updateKey.id).clone().children().remove().end().text())
  if(!isUrl(inputModal.value)) {
    ele.addClass('key-button')
    ele.removeClass('url-button')
    hotkeyDestylize(ele, 'custom-' + $('#customSelect option:selected').attr('id').slice(7), updateKey.id, inputModal.value)
    if (altText.value){
      console.log("Alt text dectected");
      altTextStylize(ele,altText.value,updateKey.id);
    }
  } else{
    ele.addClass('url-button')
    ele.removeClass('key-button')
    hotkeyDestylize(ele, 'custom-' + $('#customSelect option:selected').attr('id').slice(7), updateKey.id, updateKey.innerText)
    if (altText.value){
      console.log("Alt text dectected");
      altTextStylize(ele,altText.value,updateKey.id);
    }
    else{
      hotkeyStylize(ele, 'custom-' + swiperInner.activeIndex.toString(), updateKey.id, updateKey.innerText)
    }
  }
  var inner_text = $("#"+updateKey.id).clone().children().remove().end().text();
  var alt_text = "";
  if (altText.value){
    alt_text = altText.value;
  }

  $("#"+updateKey.id).css({'width': 'auto'})
  socket.emit('saveKey', {
    index: $('#customSelect option:selected').attr('id').slice(7),
    id: updateKey.id,
    val: inner_text, 
    altText: alt_text,
    x: newX,
    y: newY, 
    pw:passcode});
  console.log(updateKey)
});

//Purpose: Used for resizing and gestures
window.dragMoveListener = dragMoveListener;


/*
-----------MOUSE CONTROLS---------------
The Following Functions Control the Mouse
*/
var touchElem = document.getElementById('mousepad');
var lcElem = document.getElementById('leftClick');
var scrollElem = document.getElementById('scrollWheel');
var rcElem = document.getElementById('rightClick');

var delta = null;
var moving = false;
var control = 'touch';
var passcode = '';
var pos = {x: 0, y: 0, cmd: null, pw: ''};

//Purpose: Wrapper Function to send information from client to server via socket
var emitMouse = function(x, y, cmd) {
  pos.x = x;
  pos.y = y;
  pos.cmd = cmd;
  pos.pw = passcode;
  socket.emit('mouse', pos);
};

//Purpose: Handles touch movement events from the clients
var handlePan = function(eventName, e) {
  if (e.type == eventName + 'start') {
    delta = null;
    moving = true;
    console.log('start ' + eventName);
    emitMouse(0, 0, eventName + 'start');
  }
  if (e.type == eventName + 'end') {
    delta = null;
    moving = false;
    emitMouse(0, 0, eventName + 'end');
  }
  if (moving && delta != null) {
    emitMouse(e.deltaX - delta.x, e.deltaY - delta.y, eventName);
  }
  delta = {x: e.deltaX, y: e.deltaY};
};

//Purpose: Using Hammer.js library to add different touching functionality
var mc = new Hammer.Manager(touchElem);
var mcRc = new Hammer.Manager(rcElem);
var mcLc = new Hammer.Manager(lcElem);
var mcScroll = new Hammer.Manager(scrollElem);

mc.add(new Hammer.Pan({event: 'move', threshold: 0, pointers: 1, direction: Hammer.DIRECTION_ALL}));
mc.add(new Hammer.Pan({event: 'scroll', threshold: 0, pointers: 2,direction: Hammer.DIRECTION_ALL}));
mcScroll.add(new Hammer.Pan({event: 'scroll', threshold: 0, pointers: 1,direction: Hammer.DIRECTION_ALL}));
mc.add(new Hammer.Pan({event: 'drag', threshold: 0, pointers: 3, direction: Hammer.DIRECTION_ALL}));
mcLc.add(new Hammer.Pan({event: 'drag', threshold: 0, pointers: 1,direction: Hammer.DIRECTION_ALL}));

//Purpose: Tapping functionality
var singleTap = new Hammer.Tap({event: 'click', pointers: 1});
var doubleTap = new Hammer.Tap({event: 'doubleclick', pointers: 1, taps: 2});
var tripleTap = new Hammer.Tap({event: 'tripleclick', pointers: 1, taps: 3});
mc.add([tripleTap, doubleTap, singleTap]);
mcLc.add([tripleTap, doubleTap, singleTap]);
tripleTap.recognizeWith([doubleTap, singleTap]);
doubleTap.recognizeWith(singleTap);
doubleTap.requireFailure(tripleTap);
singleTap.requireFailure([tripleTap, doubleTap]);
mc.add(new Hammer.Tap({event: 'rightclick', pointers: 2}));
mcRc.add(new Hammer.Tap({event: 'rightclick', pointers: 1}));

//Purpose: Using Hammer.js event listeners to trigger functionality by sending data to 
mc.on('movestart moveend moveup movedown moveleft moveright', function(e) {
    handlePan('move', e);
});

mc.on('scrollstart scrollend scrollup scrolldown scrollleft scrollright',
  function(e) {
    handlePan('scroll', e);
});
mcScroll.on('scrollstart scrollend scrollup scrolldown scrollleft scrollright',
  function(e) {
    handlePan('scroll', e);
});

mc.on('dragstart dragend dragup dragdown dragleft dragright', function(e) {
  handlePan('drag', e);
});
mcLc.on('dragstart dragend dragup dragdown dragleft dragright', function(e) {
  handlePan('drag', e);
});
mc.on('click', function(e) {
  console.log('click');
  emitMouse(0, 0, 'click');
});
mcLc.on('click', function(e) {
  console.log('click');
  emitMouse(0, 0, 'click');
});
mc.on('rightclick', function(e) {
  console.info('rightclick');
  emitMouse(0, 0, 'rightclick');
});
mcRc.on('rightclick', function(e) {
  console.info('rightclick');
  emitMouse(0, 0, 'rightclick');
});
mc.on('doubleclick', function(e) {
  console.log('doubleclick');
  emitMouse(0, 0, 'doubleclick');
});
mcLc.on('doubleclick', function(e) {
  console.log('doubleclick');
  emitMouse(0, 0, 'doubleclick');
});


/*
-----------MENU CONTROLS---------------
The Following Functions Control the Main Menu
*/

document.body.requestFullscreen = document.body.requestFullScreen ||
document.body.webkitRequestFullScreen ||
document.body.mozRequestFullScreen ||
document.body.msRequestFullScreen;
document.cancelFullscreen = document.exitFullscreen ||
document.webkitExitFullscreen ||
document.mozCancelFullScreen ||
document.msExitFullscreen;


//PURPOSE: Toggle movement functionality
$('#fullscreen-toggle').click(function() {
  if (this.checked) {
    $('.draggable').hide();
    $('#keyboard').hide();
    $("#touchpad").show();
    //document.body.requestFullscreen();
  } else {
    $('.draggable').show();
    $('#keyboard').show();
    $("#touchpad").hide();
    //document.cancelFullscreen();
  }
});

//PURPOSE: Toggle movement functionality
$('.selection').click(function() {
  if (this.checked) {
    $('.draggable').hide();
    $('#keyboard').hide();
    $("#touchpad").show();
    //document.body.requestFullscreen();
  } else {
    $('.draggable').show();
    $('#keyboard').show();
    $("#touchpad").hide();
    //document.cancelFullscreen();
  }
});

//PURPOSE: Toggle movement functionality
$('#move-toggle').click(function() {
  if (this.checked) {
    move = true; 
  } else {
    move = false;
  }
});

//PURPOSE: If password is set, asks user for password
$('#passcode').click(function() {
  passcode = prompt('Enter a passcode');
});

//PURPOSE: About the project
$('#about').click(function() {
  if (confirm('UBoard: A mobile mouse for Brad')) {
    open('https://github.com/jjlustig/EECS498_uBoard');
  }
});

