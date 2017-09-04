/*
var canvas = document.createElement("canvas")
var ctx = canvas.getContext('2d')
canvas.width=500
canvas.height=500
document.body.appendChild(canvas)

ctx.fillColor="black"
ctx.fillRect(0,0,canvas.width,canvas.height)
*/
var fc = require('fc')
var vec2 = require('vec2')
var ctx = fc(render)

var points = [[100,100],[200,100],[150,200],[250,200],[300,300],[50,300]]

var mouse = {
  down: false,
  pos: [0, 0]
}
window.addEventListener('mousemove', function(e) {
  mouse.down = true
  mouse.pos[0] = e.clientX
  mouse.pos[1] = e.clientY
  ctx.dirty()
})

window.addEventListener('mouseup', function() {
  mouse.down = false
  ctx.dirty()
})

function render() {
  ctx.clear()
  rPoints(points)
  connect()
  drawNormals()
  if (mouse.down) {
    for (var i=0; i<points.length; i++) {
      var point = points[i]
      if (dist(point, mouse.pos) < 100) {
        rRadiusONEtoMANY(points, i)
      }
    }

  }

}
function connect(){
  ctx.beginPath()
  for (var i = 0; i < points.length; i++) {
    ctx.lineTo(points[i][0],points[i][1])
  }
  ctx.closePath()
  ctx.stroke()
}
function drawNormals2(){
  for (var i = 0; i < points.length-1; i++) {

  }
}

function drawNormals(){

  ctx.strokeStyle="cyan"
  for (var i = 0; i < points.length; i++) {
    /*delta = pointDifference(points[i-1],points[i])
    angleA = Math.atan2(delta[1],delta[0]])
    delta = pointDifference(points[i],points[i+1])
    angleB = Math.atan2(points[i],points[i+1])*/
    var vertical = vec2(0,1)
    var horizontal = vec2(1,0)

    var a = horizontal.angleTo(vertical)
    console.log(a*180/Math.PI)
    //console.log(b*180/Math.PI)
    var prev = i >= 0 ? i-1 : points.length - 1
    var next = i > points.length - 1 ? 0 : i + 1
    var p = vec2(points[prev])
    var c = vec2(points[i])
    var n = vec2(points[next])

    var edge1 = c.subtract(p, true)
    var edge2 = n.subtract(c, true)

    //console.log('perpDot', edge1.cross(edge2))
    //var angle = -Math.PI/2 +edge1.angleTo(edge2)/2
    var angle = Math.PI - edge1.angleTo(edge2)/2
    if (angle < 0) {
      // continue
      angle = -angle
    }
    var bisector = vec2(50, 0).rotate(angle).add(c)
    console.log(angle*180/Math.PI)
    ctx.beginPath()
    ctx.moveTo(points[i][0], points[i][1])
    ctx.lineTo(bisector.x, bisector.y)
    ctx.stroke()
  }
}
function pointDifference(pointA,pointB){
  return [(pointA[0]-pointB[0]),(pointA[1]-pointB[1])]
}
function rPoints(points){
	ctx.fillColor="cyan"
	for (var i = 0; i < points.length; i++) {
		ctx.beginPath()
		ctx.fillStyle="white"
		ctx.arc(points[i][0],points[i][1],3,0,2*Math.PI,false)
		ctx.fill()
	}
}
function rRadiusONEtoMANY(points,x){
	var pointA = points[x]
	for (var i = 0; i < points.length; i++) {

		//draw cirle stroke
		ctx.beginPath()
		ctx.strokeStyle = "red"
		ctx.arc(pointA[0],pointA[1],dist(pointA,points[i]), 0, 2*Math.PI)
		ctx.stroke()
	}

}
window.rRadiusONEtoMANY = rRadiusONEtoMANY
function createInboundPoint(){
	var p = [Math.random()*ctx.canvas.width,Math.random()*ctx.canvas.height]
	return p;
}
function cd(){
	var e = document.createElement("div")
	return e;
}
function dist(a,b){
	var d = [a[0]-b[0],a[1]-b[1]]
	var distance = Math.sqrt(Math.pow(d[0],2)+Math.pow(d[1],2))
	return distance;
}
