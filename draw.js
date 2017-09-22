var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var express = require("express");


var dir = __dirname + "/static/";
app.get('/', function(req, res){
  res.sendFile(dir + '/index.html');
});
app.use('/external/', express.static(__dirname + "/static/"));


var IOMap = new Object();

function IOBoard(x, y, x2, y2, cX, cY, color, size) {
    if (typeof IOMap[cX] != "undefined") {

    } else {
        IOMap[cX] = new Object();
    }

    if (typeof IOMap[cX][cY] != "undefined") {
            IOMap[cX][cY].push(0 + "x" + x + "x" + y + "x" + x2 + "x" + y2 + "x" + color + "x" + size);
    }  else {
        IOMap[cX][cY] = [];
        IOMap[cX][cY].push(0 + "x" + x + "x" + y + "x" + x2 + "x" + y2 + "x" + color + "x" + size);

    }
    setTimeout(function() {
      IOMap[cX][cY].shift();
    }, 2000);
}

function IOCGet(cX,cY) {
        if (typeof IOMap[cX] != "undefined") {

    } else {
        IOMap[cX] = new Object();
    }

    if (typeof IOMap[cX][cY] != "undefined") {
    }  else {
        IOMap[cX][cY] = [];

    }
    return IOMap[cX][cY];
}
io.on('connection', function(socket){
    socket.on("reqData", function(data) {

var chunkX = data[0];
var chunkY = data[1];
        socket.emit("return", IOCGet(chunkX, chunkY))
    });

    socket.on("writeData", function(dataz) {
        dataz.forEach(function(data) {
    /*
    0: chunkx
    1: chunky
    2: startx
    3: starty
    4: endx
    5: endy
    6: color
    7: size
    */
        IOBoard(data[2],data[3],data[4],data[5],data[0],data[1], data[6], data[7]);

          });
    });
});

var port = 3001;
http.listen(port, function(){
  console.log('listening on *:' + port);
});
function getUse() {
  var t = [];
  var xes = Object.keys(IOMap);
  xes.forEach(function (element){
    var yc = Object.keys(IOMap[element]);
      yc.forEach(function (element2){
    t = t.concat([[element, element2]]);
  });
  });
  io.emit("online", t);
  return 0;
}

function clean() {
  var t = [];
  var xes = Object.keys(IOMap);
  xes.forEach(function (element){
    var yc = Object.keys(IOMap[element]);
      yc.forEach(function (element2){

    if (!IOMap[element][element2].length > 0) {
      delete IOMap[element][element2];
    }
  });
  });
  return 0;
}


setInterval(function() {
  clean();
}, 5000);
setInterval(function() {
  getUse();
}, 5000);
