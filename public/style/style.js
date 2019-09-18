//KEYBOARD CODE
//Adds keyboard elements dynamically
document.body.onload = addKeyboard; 

function addKeyboard () { 
  var keys = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q','R','S','T','U','V','W','X','Y','Z','#','@','*',')','('];
  for (var i = 0; i < keys.length; i++) { 

    // create a new div element 
    var newDiv = document.createElement("button"); 

    // give class name
    newDiv.className = 'draggable';
    newDiv.id = "button" + (i+1).toString()

    // and give it some content 
    var key = document.createTextNode(keys[i]); 
    // add the text node to the newly created div
    newDiv.appendChild(key);  

    // add the newly created element and its content into the DOM 
    var keyboard = document.getElementById("keyboard"); 
    keyboard.appendChild(newDiv);
  } 
};

$(window).on("load", function()  {
    $('.draggable').click(function() {
      console.log("test");
      if (move === false){
      var str = this.html();
      console.log(str);
    }
  });
});