var drawio = [];
var cache = [];
var usernames = [];
var socket = io();

var pos = new Object();

function get(name){
if(name=(new RegExp('[?&]'+encodeURIComponent(name)+'=([^&]*)')).exec(location.search))
  return decodeURIComponent(name[1]);
}


if (get("username") == null) {
  document.getElementById("username").value = "Anonymous";
} else {
  document.getElementById("username").value = get("username");
}
if (get("settings") == null) {
var allowDrawing = true;
} else {
var  c = get("settings");
c = JSON.parse("[" + c + "]");
var allowDrawing = c[3];
if (c[0] == false) {
  document.getElementById("ponline").style.display = "none";
}
if (c[1] == false) {
  document.getElementById("use").style.display = "none";
}

if (c[2] == false) {
  document.getElementById("sp").innerHTML = '<span class="nav" style="cursor:pointer" >SyncDraw</span>';
}

}


if (get("CCX") == null) {
  var CCX = Math.floor(Math.random() * 90000) + 10000;

} else {
var CCX = get("CCX");
}
if (get("delay") == null) {
 delay = 250;
} else {
 delay = get("delay");
}
if (get("chunk") == null) {
pos.x = 0;
pos.y = 0;
} else {
    var ch = get("chunk").split(',');
 pos.x = ch[0];
 pos.y = ch[1];

}

if (get("share") == null) {
    var rrid = 0;
} else {
 var rrid = get("share");
 drawio = drawio.concat([["GS", rrid, pos.x, pos.y]]);
}
var port = window.location.port;
if (port == "" || port == 0) {
    port = "";
} else {
    port = ":" + port;
}
document.getElementById("cx").innerHTML = pos.x;
document.getElementById("cy").innerHTML = pos.y;
pos.x = document.getElementById("x").value = pos.x;
pos.y = document.getElementById("y").value = pos.y;

document.getElementById("link").value = window.location.protocol + "//" + window.location.hostname+ port + "/join#" +shuuid;
function move() {
  pos.x = document.getElementById("x").value;
  pos.y = document.getElementById("y").value;
    document.getElementById("link").value = window.location.protocol + "//" + window.location.hostname+ port + "/join#" +shuuid;
  reset();
  socket.emit("reqData", [pos.x,pos.y]);
  document.getElementById("cx").innerHTML =  pos.x;
  document.getElementById("cy").innerHTML =  pos.y;
}
window.setInterval(function(){
socket.emit("writeData", drawio);
    drawio = [];
        socket.emit("reqData", [pos.x,pos.y]);


}, delay);

var codeIsPublic = false;


window.setInterval(function(){
       if (codeIsPublic == true) {
          socket.emit("shareCode", [shuuid, pos.x, pos.y, true]);
       } else {
           socket.emit("shareCode", [shuuid, pos.x, pos.y, false]);
       }
}, 1000);
var admin = get("a");
var rw = get("rw");
if (admin  == "1") {
  var alACC = [];
}
window.setInterval(function(){
var a = "";
if (admin == "1" && rw != "1") {
  usernames.forEach(function(u) {
    if (alACC.includes("a_" + u[0])) {
      a += '<input type="checkbox" id="a_' + u[0] + '" checked>' + "<a>" + u[1] + "</a><br>";

    } else {
    a += '<input type="checkbox" id="a_' + u[0] + '">' + "<a>" + u[1] + "</a><br>";
}



  });
  document.getElementById("ponline").innerHTML = a;

  if (admin == "1" && rw != "1") {
    usernames.forEach(function(u) {

      document.getElementById("a_" + u[0]).addEventListener( 'change', function() {
      if(this.checked) {
          socket.emit("allowAccess", [CCX, this.id, 1, pos.x, pos.y]);
          alACC.push(this.id);
      } else {
        socket.emit("allowAccess", [CCX, this.id, 0, pos.x, pos.y]);
        var index = alACC.indexOf(this.id);    // <-- Not supported in <IE9
        if (index !== -1) {
          alACC.splice(index, 1);
  }
      }
  });

});
  }
  drawio = drawio.concat([["USN", pos.x, pos.y, CCX, document.getElementById("username").value]]);

} else {
       usernames.forEach(function(u) {
         a += "<a>" + u[1] + "</a><br>";
       });
       document.getElementById("ponline").innerHTML = a;
       drawio = drawio.concat([["USN", pos.x, pos.y, CCX, document.getElementById("username").value]]);

socket.emit("allowed", [pos.x, pos.y, CCX]);
}
}, 1000);
socket.on("a_allowed", function(r) {
  allowDrawing = r;
});
function toggleCode() {
  if (codeIsPublic == false) {
    codeIsPublic = true;
    document.getElementById("public").innerHTML = "PUBLIC";
    document.getElementById("public").style.color = "green";
  } else {
    codeIsPublic = false;
    document.getElementById("public").innerHTML = "PRIVATE";
    document.getElementById("public").style.color = "red";


  }
}


socket.on("return", function(data) {
    data.forEach(function(write) {
        write = write.split("|");
        if (write[0] == "0") {
        draw(write[1], write[2], write[3], write[4], write[5], write[6]);
        }
        else if(write[0] == "1") {
            if (shuuid == write[1]) {
                drawio = drawio.concat([["XOS", shuuid, document.getElementById("writer").toDataURL("image/jpeg"), pos.x, pos.y]]);            }
        } else if (write[0] == "2") {
            if (rrid != 0) {
                if (rrid == write[2]) {
                 var image = new Image();
                    image.onload = function() {
                    ctx.drawImage(image, 0, 0);
                    };
                image.src = write[1];
                }
            }
        } else if(write[0] == "4") {
          write[2] // username
          write[1] // id
          usernames = usernames.concat([[write[1], write[2]]]);
          setTimeout(function() {
            usernames.shift();
          }, 250);

        }

         else {
        }
    });
});

function draw(x1,y1, x2, y2, co, s) {
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.lineWidth=s;
      ctx.strokeStyle = co;
      ctx.stroke();
}

socket.on("online", function(data) {
      var x = "";
  data.forEach(function(element) {
      if (element[0] == 0) {
    var p = "";
    if (pos.x == element[1] && pos.y == element[2]) {
      p = "(you) ";
    }
    x += p + " <a href='?chunk=" + element[1] + "," + element[2] + "'>" + element[1] + ", " + element[2] + "</a><br>";
      } else {
          if (element[3] == null) {} else {
              if (element[3] == shuuid) {
              var p = "(you) ";
              } else {
              var p = "";

              }
            x += p +" <a onclick='restoreFromClick("+ element[3] + "," + element[1] + "," + element[2] +");'>"+ element[1] + ", " + element[2] + " (" + element[3] + ")</a><br>";
          }
      }
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

function restoreFromClick(code,x,y) {
  document.getElementById("x").value = x;
  document.getElementById("y").value = y;
  move();
    rrid = code;
    drawio = drawio.concat([['GS', rrid, pos.x, pos.y]]);
}

var mouseDown = false;
document.body.onmousedown = function() {
mouseDown = true;

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
  if (allowDrawing == true) {

var mousePos = getMousePos(canvas, evt);
if (mouseDown) {
if (lx == 0 && ly == 0) {
    draw(mousePos.x, mousePos.y, mousePos.x, mousePos.y, color, size);
  drawio = drawio.concat([[pos.x,pos.y,mousePos.x, mousePos.y, mousePos.x, mousePos.y, color, size, CCX]]);

} else {
  drawio = drawio.concat([[pos.x,pos.y,lx, ly, mousePos.x, mousePos.y, color, size, CCX]]);
    draw(lx, ly, mousePos.x, mousePos.y, color, size);
}

lx = mousePos.x;
ly = mousePos.y;
}
}
}, false);

var startx = 0;
var starty = 0;
canvas.addEventListener('touchstart', function(e) {
  if (allowDrawing == true) {

var rect = canvas.getBoundingClientRect();

var touchobj = e.changedTouches[0];
startx = parseInt(touchobj.clientX - rect.left);
starty = parseInt(touchobj.clientY - rect.top);
e.preventDefault()
}
}, false)

canvas.addEventListener('touchmove', function(e) {
  if (allowDrawing == true) {

var rect = canvas.getBoundingClientRect();

var touchobj = e.changedTouches[0];
if (touchobj.clientX - rect.left > 1000 || touchobj.clientX - rect.left < 0 || touchobj.clientY - rect.top < 0 || touchobj.clientY - rect.top > 1000) {} else {
if (startx == 0 && starty == 0) {
draw(touchobj.clientX - rect.left, touchobj.clientY - rect.top, touchobj.clientX - rect.left, touchobj.clientY - rect.top, color, size);
drawio = drawio.concat([[pos.x,pos.y,Math.round(touchobj.clientX - rect.left), Math.round(touchobj.clientY - rect.top), Math.round(touchobj.clientX), Math.round(touchobj.clientY), color, size, CCX]]);

} else {
draw(startx, starty, touchobj.clientX - rect.left, touchobj.clientY - rect.top, color, size);
drawio = drawio.concat([[pos.x,pos.y,Math.round(startx), Math.round(starty), Math.round(touchobj.clientX - rect.left), Math.round(touchobj.clientY - rect.top), color, size, CCX]]);

}
startx = touchobj.clientX - rect.left;
starty = touchobj.clientY - rect.top;

}

e.preventDefault()
}
}, false)


canvas.addEventListener('touchend', function(e) {
  if (allowDrawing == true) {

startx = 0;
starty = 0;
}
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
$("#colorpicker").spectrum({
    color: "#000000",
    change: function(colors) {
    color = colors.toHexString();
}
});

function setSize() {
  size = document.getElementById("size").value;
}
var size = 1;

function get_uuid() {
    if (shuuid == 0) {
socket.emit("get_uuid", [pos.x,pos.y]);
    } else {
    alert("You have already gotten a share id!");
    }
}
var shuuid = 0;
socket.on("rec_uuid", function(id) {
    shuuid = id;
    document.getElementById("ShareCode").innerHTML =  shuuid;
    document.getElementById("link").value = window.location.protocol + "//" + window.location.hostname+ port + "/join#" +shuuid;
if (get("a") == 1) {
    document.getElementById("cinfo").innerHTML = "<h2>Go to <font color='blue'>https://syncdraw.lefty.cf/join</font> and enter the code <font color='blue'>" + shuuid + "</font>!</h2>";
}
});

socket.on("uuid_info", function(ret) {
  if (ret[0] == "no_exist") {
    alert("join code invalid!");
  } else {
  document.getElementById("x").value = ret[0];
  document.getElementById("y").value = ret[1];
  move();
  var c = ret[2];
  console.log(c);
  allowDrawing = c[3];
  if (c[0] == false) {
    document.getElementById("ponline").style.display = "none";
  }
  if (c[1] == false) {
    document.getElementById("use").style.display = "none";
  }

  if (c[2] == false) {
    document.getElementById("sp").innerHTML = '<span class="nav" style="cursor:pointer" >SyncDraw</span>';
    document.getElementById("cinfo").innerHTML = "<font color='red'>This room has the menu disabled. Reload the page to leave.</font>";

  }



  drawio = drawio.concat([["GS", rrid, pos.x, pos.y]]);
}
});
function sharerestore() {
    reset();
     rrid = document.getElementById("scre").value;
socket.emit("get_uuid_info", rrid);
}


document.getElementById("size").addEventListener('input', function (evt) {
    setSize();
});



get_uuid(); // this makes stuff more automatic and easy
