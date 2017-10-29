var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var express = require("express");


var dir = __dirname + "/static/";
app.get('/', function(req, res){
  res.sendFile(dir + '/index.html');
});

app.get('/join', function(req, res){
  res.sendFile(dir + '/join.html');
});
app.use('/external/', express.static(__dirname + "/static/"));

var IOMap = new Object();
var IOUUID = new Object();
function IOBoard(x, y, x2, y2, cX, cY, color, size) {
    if (typeof IOMap[cX] != "undefined") {

    } else {
        IOMap[cX] = new Object();
    }

    if (typeof IOMap[cX][cY] != "undefined") {
            IOMap[cX][cY].push(0 + "|" + x + "|" + y + "|" + x2 + "|" + y2 + "|" + color + "|" + size);
    }  else {
        IOMap[cX][cY] = [];
            IOMap[cX][cY].push(0 + "|" + x + "|" + y + "|" + x2 + "|" + y2 + "|" + color + "|" + size);

    }
    setTimeout(function() {
      IOMap[cX][cY].shift();
    }, 1000);
}

function IOAddShare(uuid, data,cX,cY) {
    if (typeof IOMap[cX] != "undefined") {

    } else {
        IOMap[cX] = new Object();
    }

    if (typeof IOMap[cX][cY] != "undefined") {
            IOMap[cX][cY].push(2 + "|" + data + "|" + uuid);
    }  else {
        IOMap[cX][cY] = [];
        IOMap[cX][cY].push(2 + "|" + data + "|" + uuid);

    }
    setTimeout(function() {
      IOMap[cX][cY].shift();
    }, 1000);
}

function IOShareUUID(uuid,cX,cY) {
    if (typeof IOUUID[cX] != "undefined") {

    } else {
        IOUUID[cX] = new Object();
    }

    if (typeof IOUUID[cX][cY] != "undefined") {
            IOUUID[cX][cY].push(uuid);
    }  else {
        IOUUID[cX][cY] = [];
        IOUUID[cX][cY].push(uuid);

    }
    setTimeout(function() {
      IOUUID[cX][cY].shift();
    }, 2000);
}



function IOAddRecieve(uuid,cX,cY) {
    if (typeof IOMap[cX] != "undefined") {

    } else {
        IOMap[cX] = new Object();
    }

    if (typeof IOMap[cX][cY] != "undefined") {
            IOMap[cX][cY].push(1 + "|" + uuid);
    }  else {
        IOMap[cX][cY] = [];
        IOMap[cX][cY].push(1 + "|" + uuid);

    }
    setTimeout(function() {
      IOMap[cX][cY].shift();
    }, 1000);
}
var UUIDKeeper = new Object();
function ValidUUID(uuid,cX,cY) {
  UUIDKeeper[uuid] = [cX, cY];
}

function IOShare(x, y) {
    var uuid = Math.floor(Math.random() * 90000) + 10000;
    return uuid;
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
  socket.on("get_uuid_info", function(idin) {
    if (typeof UUIDKeeper[idin] == "undefined") {
      socket.emit("uuid_info", ["no_exist"]);

    } else {
    socket.emit("uuid_info", UUIDKeeper[idin]);
  }
  });
    socket.on("shareCode", function(dat) {
        if (!isNaN(dat[0]) && String(dat[0]).length == 5)  {
        if (dat[3] == true) {
         IOShareUUID(dat[0], dat[1], dat[2]);
         ValidUUID(dat[0], dat[1], dat[2]);
        } else {
         ValidUUID(dat[0], dat[1], dat[2]);
        }
      }
        });
    socket.on("get_uuid", function(dat) {
       socket.emit("rec_uuid", IOShare(dat.x, dat.y));
    });

    socket.on("reqData", function(data) {

var chunkX = data[0];
var chunkY = data[1];
if (!isNaN(chunkX) && !isNaN(chunkY)) {
        socket.emit("return", IOCGet(chunkX, chunkY));
      };
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

            /*
            0: informer
            1: uuid
            2: data
            3: x
            4: y
            */

            if (data[0] == "XOS") {
            IOAddShare(data[1], data[2], data[3], data[4]);
            } else if (data[0] == "GS")  {
            IOAddRecieve(data[1], data[2], data[3]);
            } else {
    if (!isNaN(data[2]) && !isNaN(data[3])) {
        IOBoard(data[2],data[3],data[4],data[5],data[0],data[1], data[6], data[7]);
      }

            }
          });
    });
});

var port = 3001;
http.listen(port, function(){
  console.log('listening on *:' + port);
});
function getUse() {
  var t = [];



    var n = Object.keys(IOUUID);
    n.forEach(function(element) {
     var n2 = Object.keys(IOUUID[element]);
        n2.forEach(function(element2) {
           t = t.concat([[1, element, element2, IOUUID[element][element2][0]]]);
        });
    })

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
}, 2500);
