/*
*
* DISCLAIMER: Javascript is terrible, and these utils are NOT intended for use in the general case
* for JS and all of its terribleness. These functions operate only on the most naively constructed of
* objects. If you're trying to do something fancy and these don't work for you, please take the
* rest of the day off to question your life choices. I wish you the best of luck.
*
*/

//maps attributes found in defaults from init onto obj, falling back to defaults value if not present in init
var doMapInitDefaults = function(obj, init, defaults)
{
  var attribs = Object.keys(defaults);
  for(var i = 0; i < attribs.length; i++)
  {
    var k = attribs[i];
    obj[k] = init.hasOwnProperty(k) ? init[k] : defaults[k];
  }
}

//sets doX and doY as x/y offset into the object listening for the event
function doSetPosOnEvent(evt)
{
  if(evt.offsetX != undefined)
  {
    evt.doX = evt.offsetX;
    evt.doY = evt.offsetY;
  }
  else if(evt.touches != undefined && evt.touches[0] != undefined)
  {
    //unfortunately, seems necessary...
    var t = evt.touches[0].target;

    var box = t.getBoundingClientRect();
    var body = document.body;
    var docEl = document.documentElement;

    var scrollTop = window.pageYOffset || docEl.scrollTop || body.scrollTop;
    var scrollLeft = window.pageXOffset || docEl.scrollLeft || body.scrollLeft;

    var clientTop = docEl.clientTop || body.clientTop || 0;
    var clientLeft = docEl.clientLeft || body.clientLeft || 0;

    var top  = box.top +  scrollTop - clientTop;
    var left = box.left + scrollLeft - clientLeft;

    evt.doX = evt.touches[0].pageX-left;
    evt.doY = evt.touches[0].pageY-top;

  }
  else if(evt.layerX != undefined && evt.originalTarget != undefined)
  {
    evt.doX = evt.layerX-evt.originalTarget.offsetLeft;
    evt.doY = evt.layerY-evt.originalTarget.offsetTop;
  }
  else //give up because javascript is terrible
  {
    evt.doX = 0;
    evt.doY = 0;
  }
}

function feq(f1,f2,e)
{
  return (f1 < f2+e && f1 > f2-e);
}

var randB = function()
{
  return Math.random() >= 0.5;
}
function randIntBelow(n)
{
  return Math.floor(Math.random()*n);
}
function rand0()
{
  return (Math.random()*2)-1;
}
var randR = function(f,t)
{
  return lerp(f,t,Math.random());
}
//because the Math namespace is probably unnecessary for our purposes
var rand = Math.random;
var round = Math.round;
var floor = Math.floor;
var ceil = Math.ceil;
var abs = Math.abs;
var min = Math.min;
var max = Math.max;
var sqrt = Math.sqrt;
var sin = Math.sin;
var cos = Math.cos;
var psin = function(t) { return (Math.sin(t)+1)/2; }
var pcos = function(t) { return (Math.cos(t)+1)/2; }
var atan2 = Math.atan2;
var pi = Math.PI;
var twopi = 2*pi;
var halfpi = pi/2;

var fdisp = function(f,n) //formats float for display (from 8.124512 to 8.12)
{
  if(n == undefined) n = 2;
  var d;
  d = Math.pow(10,n);
  var str = (Math.round(f*d)/d)+"";
  if(str.indexOf(".") == -1)
  {
    str += ".";
    for(var i = 0; i < n; i++) //uh oh...
      str += "0";
  }
  return str;
}

function clamp(a,b,v)
{
  if(v < a) return a;
  if(v > b) return b;
  return v;
}

function lerp(s,e,t)
{
  return s+((e-s)*t);
}

function invlerp(s,e,v)
{
  return (v-s)/(e-s);
}

function clerp(s,e,t)
{
  while(s < 0) s += Math.PI*2;
  while(e < 0) e += Math.PI*2;

       if(e > s && e-s > s-(e-Math.PI*2)) e -= Math.PI*2;
  else if(s > e && s-e > (e+Math.PI*2)-s) e += Math.PI*2;

  return lerp(s,e,t)%(Math.PI*2);
}

function cdist(a,b)
{
  while(a < 0) a += Math.PI*2;
  while(b < 0) b += Math.PI*2;
  var dist = Math.abs(a-b);
  if(dist > Math.PI) dist = Math.PI*2-dist;

  return dist;
}

function mapVal(from_min, from_max, to_min, to_max, v)
{
  return ((v-from_min)/(from_max-from_min))*(to_max-to_min)+to_min;
}
function mapPt(from,to,pt)
{
  pt.x = ((pt.x-from.x)/from.w)*to.w+to.x;
  pt.y = ((pt.y-from.y)/from.h)*to.h+to.y;
  return pt;
}
function mapRect(from,to,rect)
{
  rect.x = ((rect.x-from.x)/from.w)*to.w+to.x;
  rect.y = ((rect.y-from.y)/from.h)*to.h+to.y;
  rect.w = (rect.w/from.w)*to.w;
  rect.h = (rect.h/from.h)*to.h;
  return rect;
}

var ptWithin = function(ptx, pty, x, y, w, h)
{
  return (ptx >= x && ptx <= x+w && pty >= y && pty <= y+h);
}
var ptWithinObj = function(ptx, pty, obj)
{
  return ptWithin(ptx, pty, obj.x, obj.y, obj.w, obj.h);
}
var objWithinObj = function(obja, objb)
{
  console.log("not done!");
  return false;
}
var ptNear = function(ptx, pty, x, y, r)
{
  var w2 = (ptx-x)*(ptx-x);
  var h2 = (pty-y)*(pty-y);
  var d2 = r*r;
  return w2+h2 < d2;
}

var decToHex = function(dec, dig)
{
  var r = "";
  dig--;
  var mod = Math.pow(16,dig);

  var index = ["0","1","2","3","4","5","6","7","8","9","A","B","C","D","E","F"];
  for(; dig >= 0; dig--)
  {
    var v = Math.floor(dec/mod);
    r += index[v];
    dec -= Math.pow(16,dig)*v;
    mod /= 16;
  }

  return r;
}

var RGB2HSL = function(rgb, hsl)
{
  var cmax = Math.max(rgb.r,rgb.g,rgb.b);
  var cmin = Math.min(rgb.r,rgb.g,rgb.b);
  var d = cmax-cmin;
  hsl.l = (cmax+cmin)/2;
  if(hsl.l < 0.5) hsl.s = (cmax-cmin)/(cmax+cmin);
  else            hsl.s = (cmax-cmin)/(2-cmax-cmin);

  if(cmax == rgb.r) hsl.h = (rgb.g-rgb.b)/(cmax-cmin);
  if(cmax == rgb.g) hsl.h = 2 + (rgb.b-rgb.r)/(cmax-cmin);
  if(cmax == rgb.b) hsl.h = 4 + (rgb.r-rgb.g)/(cmax-cmin);

  hsl.h *= 60;

  if(hsl.h < 0) hsl.h += 360;
}

var HSL2RGBHelperConvertTMPValToFinal = function(tmp_1, tmp_2, val)
{
  if(val*6 < 1) return tmp_2 + (tmp_1-tmp_2)*6*val;
  else if(val*2 < 1) return tmp_1;
  else if(val*3 < 2) return tmp_2 + (tmp_1-tmp_2)*(0.666-val)*6;
  else return tmp_2;
}
var HSL2RGB = function(hsl, rgb)
{
  var tmp_1;
  var tmp_2;
  var tmp_3;

  if(hsl.l < 0.5) tmp_1 = hsl.l * (1+hsl.s);
  else            tmp_1 = hsl.l + hsl.s - (hsl.l*hsl.s);

  tmp_2 = (2*hsl.l)-tmp_1;
  tmp_3 = hsl.h/360;

  rgb.r = tmp_3 + 0.333; while(rgb.r > 1) rgb.r -= 1; while(rgb.r < 0) rgb.r += 1;
  rgb.g = tmp_3;         while(rgb.g > 1) rgb.g -= 1; while(rgb.g < 0) rgb.g += 1;
  rgb.b = tmp_3 - 0.333; while(rgb.b > 1) rgb.b -= 1; while(rgb.b < 0) rgb.b += 1;

  rgb.r = HSL2RGBHelperConvertTMPValToFinal(tmp_1, tmp_2, rgb.r);
  rgb.g = HSL2RGBHelperConvertTMPValToFinal(tmp_1, tmp_2, rgb.g);
  rgb.b = HSL2RGBHelperConvertTMPValToFinal(tmp_1, tmp_2, rgb.b);
}

var RGB2Hex = function(rgb)
{
  return "#"+dec2Hex(Math.floor(rgb.r*255))+dec2Hex(Math.floor(rgb.g*255))+dec2Hex(Math.floor(rgb.b*255));
}
var dec2Hex = function(n)
{
  return n.toString(16);
}

var cartToPolar = function(cart,polar)
{
  polar.len = Math.sqrt((cart.x*cart.x)+(cart.y*cart.y));
  polar.dir = Math.atan2(cart.y,cart.x);
}
var polarToCart = function(polar,cart)
{
  cart.x = Math.cos(polar.dir)*polar.len;
  cart.y = Math.sin(polar.dir)*polar.len;
}

//short name- will be used often to place elements by percent, while guaranteeing integer results
var p    = function(percent, of) { return Math.floor(percent * of); }
var invp = function(      n, of) { return n/of; }
var setBox = function(obj, x,y,w,h)
{
  obj.x = x;
  obj.y = y;
  obj.w = w;
  obj.h = h;
}

var queryRectCollide = function(a,b)
{
  return a.x < b.x+b.w && b.x < a.x+a.w && a.y < b.y+b.h && b.y < a.y+a.h;
}

var screenSpace = function(cam, canv, obj)
{
  //assumng xywh counterparts in world space (wx,wy,ww,wh,etc...)
  //where wx,wy is *center* of obj and cam
  //so cam.wx = 0; cam.ww = 1; would be a cam centered at the origin with visible range from -0.5 to 0.5
  //output xywh assume x,y is top left (ready to be 'blit' via canvas api)
  obj.w = (obj.ww/cam.ww)*canv.width;
  obj.h = (obj.wh/cam.wh)*canv.height;
  obj.x = (((( obj.wx-obj.ww/2)-cam.wx)+(cam.ww/2))/cam.ww)*canv.width;
  obj.y = ((((-obj.wy-obj.wh/2)+cam.wy)+(cam.wh/2))/cam.wh)*canv.height;
}
var worldSpace = function(cam, canv, obj) //opposite of screenspace
{
  obj.wx = ((obj.x/canv.width) -0.5)*cam.ww + cam.wx;
  obj.wy = -((obj.y/canv.height)-0.5)*cam.wh + cam.wy;
  obj.ww = (obj.w/canv.width)*cam.ww;
  obj.wh = (obj.h/canv.height)*cam.wh;
}
function tldistsqr(a,b)
{
  var x = b.x-a.x;
  var y = b.y-a.y;
  return x*x+y*y;
}
function tldist(a,b)
{
  var x = b.x-a.x;
  var y = b.y-a.y;
  return Math.sqrt(x*x+y*y);
}
function distsqr(a,b)
{
  var x = (b.x+b.w/2)-(a.x+a.w/2);
  var y = (b.y+b.h/2)-(a.y+a.h/2);
  return x*x+y*y;
}
function dist(a,b)
{
  var x = (b.x+b.w/2)-(a.x+a.w/2);
  var y = (b.y+b.h/2)-(a.y+a.h/2);
  return Math.sqrt(x*x+y*y);
}
function wdistsqr(a,b)
{
  var x = b.wx-a.wx;
  var y = b.wy-a.wy;
  return x*x+y*y;
}
function wdist(a,b)
{
  var x = b.wx-a.wx;
  var y = b.wy-a.wy;
  return Math.sqrt(x*x+y*y);
}

function noop(){}
function ffunc(){return false;}
function tfunc(){return true;}

function drawArrow(canv,sx,sy,ex,ey,w)
{
  var dx = ex-sx;
  var dy = ey-sy;
  var dd = Math.sqrt(dx*dx+dy*dy);
  var ox = -dy;
  var oy = dx;
  var od = Math.sqrt(ox*ox+oy*oy);
  var ox = (ox/od)*w;
  var oy = (oy/od)*w;
  canv.context.beginPath();
  canv.context.moveTo(sx,sy);
  canv.context.lineTo(ex,ey);
  canv.context.lineTo(sx+(dx/dd*(dd-w))+ox,sy+(dy/dd*(dd-w))+oy);
  canv.context.moveTo(ex,ey);
  canv.context.lineTo(sx+(dx/dd*(dd-w))-ox,sy+(dy/dd*(dd-w))-oy);
  canv.context.stroke();
}

function drawAroundDecimal(canv,x,y,val,prepend,append)
{
  var macro = floor(val);
  var vstring = val+"";
  var i = vstring.indexOf(".");
  var micro;
  if(i == -1) micro = "0";
  else micro = vstring.substring(i+1);
  canv.context.textAlign = "right";
  canv.context.fillText(prepend+macro+".",x,y);
  canv.context.textAlign = "left";
  canv.context.fillText(micro+append,x,y);
}

var textToLines = function(canv, font, width, text)
{
  var lines = [];
  var found = 0;
  var searched = 0;
  var tentative_search = 0;

  canv.context.save();

  canv.context.font = font;

  while(found < text.length)
  {
    searched = text.indexOf(" ",found);
    if(searched == -1) searched = text.length;
    tentative_search = text.indexOf(" ",searched+1);
    if(tentative_search == -1) tentative_search = text.length;
    while(canv.context.measureText(text.substring(found,tentative_search)).width < width && searched != text.length)
    {
      searched = tentative_search;
      tentative_search = text.indexOf(" ",searched+1);
      if(tentative_search == -1) tentative_search = text.length;
    }
    if(text.substring(searched, searched+1) == " ") searched++;
    lines.push(text.substring(found,searched));
    found = searched;
  }

  canv.context.restore();

  return lines;
}

//straight up stolen from the internet
function setCookie(name, val, days)
{
  var d = new Date();
  d.setTime(d.getTime() + (days*24*60*60*1000));
  document.cookie = name + "=" + val + "; expires="+ d.toGMTString() + "; path=/";
}
var UUIDint = function() //17 digits = 64 bit int; each second guaranteed unique, within a second = 1/99999 chance of collision (aka "not unique") 
{ 
  var d = new Date(); 
  var id = (""+d.getFullYear()).substring(2); //2 
  if(d.getMonth() < 10) id += "0"; 
  id += d.getMonth(); //4 
  if(d.getDay() < 10) id += "0"; 
  id += d.getDay(); //6 
  if(d.getHours() < 10) id += "0"; 
  id += d.getHours(); //8 
  if(d.getMinutes() < 10)  id += "0"; 
  id += d.getMinutes(); //10 
  if(d.getSeconds() < 10)  id += "0"; 
  id += d.getSeconds(); //12 
  for(var i = 0; i < 5; i++) 
    id += Math.floor(Math.random()*10); //17 
 
  return parseInt(id); 
} 
function getCookie(name)
{
  var full_cookie = decodeURIComponent(document.cookie);
  var cookies = full_cookie.split(';');
  var name = name + "="; //to ensure "indexOf" doesn't return true unless full name matches
  for(var i = 0; i < cookies.length; i++)
  {
      var c = cookies[i];
      while(c.charAt(0) == ' ') c = c.substring(1);
      if(c.indexOf(name) == 0) return c.substring(name.length, c.length);
  }
  return "";
}

