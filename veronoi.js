var fc = require('fc')
var vec2 = require('vec2')
var polygon = require('polygon')
var center = require('ctx-translate-center')
var createCamera = require('ctx-camera/ctx-camera.js')
var mouse = {
  down: false,
  pos: [0, 0]
}

var ctx = fc(render)
var camera = createCamera(ctx, window, {})

//var points = [[100,100],[200,100],[150,200],[250,200],[300,300], [150, 450],[50,300], [50, 150]]
var points = [[50,100],[100,120],[145,110],[140,100],[150,105],[160,100],[155,110],[160,120],[150,115],[130,150],[150,200],[100,180],[50,200],[70,150]]
scalePoints(10)
// var points = [[100, 100], [200, 100], [200, 400], [50, 400], [100, 200]]
//var points = require('./ny').map(p => [p[0] * 500, p[1] * -500])
var poly = polygon(points).dedupe().simplify()

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

var aabb = poly.aabb()
aabb.center = [aabb.x + aabb.w/2, aabb.y + aabb.h / 2]
function render() {


  ctx.clear()

  camera.begin()
    ctx.translate(-aabb.center[0], -aabb.center[1])
    center(ctx)

    ctx.pointToWorld(mouse.pos, camera.mouse.pos)
  rPoints(points)
  connect()
  //drawNormals()
  //drawNormals2()
  drawNormals3()




  var mousePos = vec2(mouse.pos)
  var medialAxis = []
  poly.each(function (p, c, n, i) {
    var radius = Math.max(aabb.w, aabb.h) * 1.5
    var normal = vertexNormal(p, c, n).negate()

    var e1 = c.subtract(p, true)
    var e2 = c.subtract(n, true)

    if (e1.perpDot(e2) > 0) {
      ctx.beginPath()
      ctx.moveTo(c.x + 5, c.y)
      ctx.arc(c.x, c.y, 5, 0, Math.PI * 2)
      ctx.strokeStyle = 'orange'
      ctx.stroke()
    }

    var sentinel = 100
    var debug = mousePos.distance(c) < 10
    var brk = false
    while (sentinel--) {
      var result = fitCircle(radius, normal, c, debug)
      var n = result.closest.distance(c)
      var angle = c.subtract(result.center, true).angleTo(c.subtract(result.closest, true))
      var newRadius = n / (2 * Math.cos(angle))

      if (!newRadius || newRadius >= radius) {

        // fixup points centerpoints that land outside of the polygon
        if (!poly.containsPoint(result.center)) {
          var closest = poly.closestPointTo(result.center)

          var n = closest.distance(c)
          var angle = c.subtract(result.center, true).angleTo(c.subtract(closest, true))
          radius = n / (2 * Math.cos(angle))
          continue
        }

        if (debug) {
          ctx.beginPath()
          ctx.arc(result.center.x, result.center.y, radius, 0, Math.PI * 2)
          ctx.strokeStyle = debug ? 'green' : 'grey'
          ctx.stroke()
        }

        ctx.beginPath()
        ctx.arc(result.center.x, result.center.y, 5, 0, Math.PI * 2)
        ctx.fillStyle = debug ? 'green' : 'grey'
        ctx.fill()
        result.center.original = c
        medialAxis.push(result.center)
        break
      }

      radius = newRadius
    }
    // rRadiusONEtoMANY(points, i)
  })


  medialAxis.forEach((v, i) => {
    // ctx.beginPath()
    // ctx.strokeStyle = "red"
    //
    // var closest = poly.closestPointTo(v)
    // var dist = closest.distance(v)
    // ctx.moveTo(v.x + dist, v.y)
    // ctx.arc(v.x, v.y, dist, 0, Math.PI*2)
    // ctx.stroke()

    var p = v.original
    var mat = v
    var dist = mat.distance(p)

    var cycles = 5
    for (var t=1; t<=cycles; t++) {

      ctx.beginPath()
      ctx.strokeStyle = `hsl(${(i / medialAxis.length) * 360}, 50%, 50%)`
      var inc = p.lerp(mat, t/cycles, true)
      ctx.arc(inc.x, inc.y, 5, 0, Math.PI*2)

      ctx.beginPath()
      var r = poly.closestPointTo(inc).distance(inc)
      // var closest = poly.closestPointTo(v)
      // var dist = closest.distance(v)
      ctx.moveTo(inc.x + r, inc.y)
      ctx.arc(inc.x, inc.y, r, 0, Math.PI*2)
      if (t === cycles) {
        ctx.save()
        ctx.lineWidth = 2
        ctx.stroke()
        ctx.restore()
      } else {
        ctx.stroke()
      }
    }
  })

  ctx.save()
  ctx.lineWidth = 5
  ctx.beginPath()
  medialAxis.forEach((p) => {
    var idx = closestVertexArray(medialAxis, p)
    var next = medialAxis[idx]
    ctx.moveTo(p.x, p.y)
    ctx.lineTo(next.x, next.y)
  })
  ctx.stroke()
  ctx.restore()
  // var filtered = [medialAxis.shift()]
  // var point = filtered[0]
  // while (medialAxis.length > 0) {
  //   var idx = closestVertexArray(medialAxis, point)
  //   point = medialAxis.splice(idx, 1)[0]
  //   filtered.push(point)
  // }
  // ctx.save()
  // ctx.lineWidth = 5
  // ctx.beginPath()
  // ctx.moveTo(filtered[0].x, filtered[0].y)
  // filtered.forEach((p, i) => {
  //   ctx.lineTo(p.x, p.y)
  // })
  // ctx.stroke()
  // ctx.restore()
  camera.end()
}


function closestVertexArray (array, vec) {
  var l = array.length
  var dist = Infinity
  var closest = -1
  for (var i = 0; i < l; i++) {
    var c = array[i]
    var d = vec.distance(c)
    if (d < dist) {
      dist = d
      closest = i
    }
  }

  return closest
}

function closestVertex (poly, vec) {
  var l = poly.length
  var dist = Infinity
  var closest = null
  for (var i = 0; i < l; i++) {
    var c = poly.point(i)
    var d = vec.distance(c)
    if (d < dist) {
      dist = d
      closest = c
    }
  }

  return closest
}

function fitCircle (radius, normal, vec, debug) {
  var circleCenter = normal.multiply(radius, true).add(vec)
  var closest = closestVertex(poly, circleCenter)

  if (debug) {
    ctx.strokeStyle = 'grey'
    ctx.beginPath()
    ctx.moveTo(vec.x, vec.y)
    ctx.lineTo(circleCenter.x, circleCenter.y)
    ctx.stroke()
    ctx.moveTo(circleCenter.x + radius, circleCenter.y)
    ctx.arc(circleCenter.x, circleCenter.y, radius, 0, Math.PI * 2)
    ctx.stroke()

    ctx.beginPath()
    ctx.fillStyle = 'grey'
    ctx.arc(circleCenter.x, circleCenter.y, 2, 0, Math.PI * 2)
    ctx.fill()

    ctx.beginPath()
    ctx.arc(closest.x, closest.y, 5, 0, Math.PI * 2)
    ctx.fillStyle = 'orange'
    ctx.fill()
  }

  return {
    closest: closest,
    center: circleCenter
  }
}

function connect(){
  ctx.save()
  ctx.strokeStyle = 'white'
  ctx.lineWidth = 2
  ctx.beginPath()
  for (var i = 0; i < points.length; i++) {
    ctx.lineTo(points[i][0],points[i][1])
  }
  ctx.closePath()
  ctx.stroke()
  ctx.restore()
}
function drawNormals2(){
  ctx.strokeStyle="yellow"
  for (var i = 0; i < points.length; i++) {
    /*delta = pointDifference(points[i-1],points[i])
    angleA = Math.atan2(delta[1],delta[0]])
    delta = pointDifference(points[i],points[i+1])
    angleB = Math.atan2(points[i],points[i+1])*/
    var vertical = vec2(0,1)
    var horizontal = vec2(1,0)

    var a = horizontal.angleTo(vertical)
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

/*
  return a vertex normal between two line segments that share a common
  point (c)

  arguments:
    p - line 0 start point
    c - common point (line 0 end / line 1 start)
    n - line 1 end point

  returns:
    normalized vec2
*/
function vertexNormal (p, c, n) {
  var e1 = c.subtract(p, true).normalize()
  var e2 = c.subtract(n, true).normalize()
  var d = e1.add(e2, true)

  if (e1.perpDot(e2) > 0) {
    d.negate()
  }

  return d.normalize()
}

function drawNormals3 () {
  ctx.strokeStyle = '#f0f'
  ctx.lineWidth = 0.6
  poly.each(function (p, c, n) {
    var normal = vertexNormal(p, c, n).multiply(50)
    var out = normal.add(c, true)

    ctx.beginPath()
    ctx.moveTo(c.x, c.y)
    ctx.lineTo(out.x, out.y)
    ctx.stroke()
  })
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
function scalePoints(scale){
	for (var i = 0; i < points.length; i++) {
		points[i][0]=points[i][0]*scale
		points[i][1]=points[i][1]*scale
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
