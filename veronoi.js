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
  drawNormals2()
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
  ctx.strokeStyle="yellow"
  ctx.lineWidth=0.6;
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

    var angle1 = c.angleTo(p)
    var angle2 = c.angleTo(n)
    var angle3 = (angle1+angle2)/2

    ctx.beginPath()
    ctx.moveTo(c.x,c.y)
    var normal = vec2(50, 0).rotate(angle1).add(c)
    ctx.lineTo(normal.x,normal.y)
    ctx.font="6px"
    ctx.fillText(Math.ceil(angle1*180/Math.PI/100)*100 ,c.x+10,c.y+10)
    ctx.fillText(Math.ceil(angle2*180/Math.PI/100)*100 ,c.x+10,c.y+20)
    ctx.fillText(Math.ceil(angle3*180/Math.PI/100)*100 ,c.x+10,c.y+30)
    ctx.stroke()
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
		ctx.strokeStyle = "hsl(180,100%,50%)"
		ctx.lineWidth = .05
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