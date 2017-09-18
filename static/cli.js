var drawio = [];
var cache = [];

var socket = io();

var pos = new Object();
pos.x = 0;
pos.y = 0;
document.getElementById("cx").innerHTML = "X: " + pos.x;
document.getElementById("cy").innerHTML = "Y: " + pos.y;
pos.x = document.getElementById("x").value = pos.y;
pos.y = document.getElementById("y").value = pos.x;
function move() {
  pos.x = document.getElementById("x").value;
  pos.y = document.getElementById("y").value;
  reset();
  socket.emit("reqData", [pos.x,pos.y]);
  document.getElementById("cx").innerHTML = "X: " + pos.x;
  document.getElementById("cy").innerHTML = "Y: " + pos.y;

}
window.setInterval(function(){
socket.emit("writeData", drawio);
    drawio = [];
        socket.emit("reqData", [pos.x,pos.y]);
}, 500);
socket.on("return", function(data) {
    data.forEach(function(write) {

        write = write.split("x");
        draw(write[0], write[1], write[2], write[3], write[4]);
    });
});

function draw(x1,y1, x2, y2, co) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = co;
      ctx.stroke(); 
}

socket.on("online", function(data) {
      var x = "";
  data.forEach(function(element) {
    x += element[0] + ", " + element[1] + "<br>";
   });
   document.getElementById("use").innerHTML = x;

});
var color = "#000000";
function scolor() {
  if (validTextColor("#" + document.getElementById("c").value)) {
    color = "#" + document.getElementById("c").value;
  } else {
    alert("Invalid color");
  }
}

function get(name){
if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
  return decodeURIComponent(name[1]);
}


var mouseDown = false;
document.body.onmousedown = function() {
mouseDown = true;
console.log("down");
}
document.body.onmouseup = function() {
mouseDown = false;
lx = 0;
ly = 0;
}

var canvas, ctx;
canvas = document.getElementById("writer");

canvas.ontouchstart = function(e) {
if (e.touches) e = e.touches[0];
return false;
}


canvas.height = 1000;
canvas.width = 1000;

ctx = canvas.getContext("2d");
function reset() {
ctx.beginPath();
ctx.rect(0, 0, 1000, 1000);
ctx.fillStyle = "white";
ctx.fill();
ctx.fillStyle = "black";
}
ctx.beginPath();
ctx.rect(0, 0, 1000, 1000);
ctx.fillStyle = "white";
ctx.fill();



ctx.fillStyle = "black";




function getMousePos(canvas, evt) {
var rect = canvas.getBoundingClientRect();
return {
x: evt.clientX - rect.left,
y: evt.clientY - rect.top
};
}
var lx = 0;
var ly = 0;


canvas.addEventListener('mousemove', function(evt) {
var mousePos = getMousePos(canvas, evt);
if (mouseDown) {
if (lx == 0 && ly == 0) {
    draw(mousePos.x, mousePos.y, mousePos.x, mousePos.y, color);
  drawio = drawio.concat([[pos.x,pos.y,mousePos.x, mousePos.y, mousePos.x, mousePos.y, color]]);

} else {
  drawio = drawio.concat([[pos.x,pos.y,lx, ly, mousePos.x, mousePos.y, color]]);
    draw(lx, ly, mousePos.x, mousePos.y, color);
}

lx = mousePos.x;
ly = mousePos.y;
}

}, false);

var startx = 0;
var starty = 0;
canvas.addEventListener('touchstart', function(e) {
var rect = canvas.getBoundingClientRect();

var touchobj = e.changedTouches[0];
startx = parseInt(touchobj.clientX - rect.left);
starty = parseInt(touchobj.clientY - rect.top);
e.preventDefault()
}, false)

canvas.addEventListener('touchmove', function(e) {
var rect = canvas.getBoundingClientRect();

var touchobj = e.changedTouches[0];
if (touchobj.clientX - rect.left > 1000 || touchobj.clientX - rect.left < 0 || touchobj.clientY - rect.top < 0 || touchobj.clientY - rect.top > 1000) {} else {
if (startx == 0 && starty == 0) {
draw(touchobj.clientX - rect.left, touchobj.clientY - rect.top, touchobj.clientX - rect.left, touchobj.clientY - rect.top, color);
drawio = drawio.concat([[pos.x,pos.y,Math.round(touchobj.clientX - rect.left), Math.round(touchobj.clientY - rect.top), Math.round(touchobj.clientX), Math.round(touchobj.clientY), color]]);

} else {
draw(startx, starty, touchobj.clientX - rect.left, touchobj.clientY - rect.top, color);
drawio = drawio.concat([[pos.x,pos.y,Math.round(startx), Math.round(starty), Math.round(touchobj.clientX - rect.left), Math.round(touchobj.clientY - rect.top), color]]);

}
startx = touchobj.clientX - rect.left;
starty = touchobj.clientY - rect.top;

}

e.preventDefault()
}, false)


canvas.addEventListener('touchend', function(e) {
startx = 0;
starty = 0;
}, false);
        socket.emit("reqData", [pos.x,pos.y]);


        function validTextColor(stringToTest) {
    //Alter the following conditions according to your need.
    if (stringToTest === "") { return false; }
    if (stringToTest === "inherit") { return false; }
    if (stringToTest === "transparent") { return false; }

    var image = document.createElement("img");
    image.style.color = "rgb(0, 0, 0)";
    image.style.color = stringToTest;
    if (image.style.color !== "rgb(0, 0, 0)") { return true; }
    image.style.color = "rgb(255, 255, 255)";
    image.style.color = stringToTest;
    return image.style.color !== "rgb(255, 255, 255)";
}
