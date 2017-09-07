var fc = require('fc')
var createCamera = require('./ctx-camera')

var ctx = fc(render)

var camera = createCamera(ctx, window, {
  mousemove: function interceptMouseMove (e, fn) {
    // where fn is now the original mousemove function that
    // maintains state and performs drag operations.
    //
    // `this` is the camera instance
    if (this.mouse.down) {
      console.log(e.clientX, e.clientY)
    }

    fn(e)
  }
})
camera.translate(window.innerWidth/2, window.innerHeight/2)
function render () {
  ctx.clear()

  ctx.fillStyle = '#aaa'
  ctx.fillRect(45, 50, 160, 50)

  camera.begin()
    ctx.fillStyle = 'red'
    ctx.beginPath()
    ctx.arc(0, 0, 200, 0, Math.PI*2, false)
    ctx.moveTo(-10, -100)
    ctx.lineTo(-10, 100)
    ctx.lineTo(10, 100)
    ctx.lineTo(10, -100)
    ctx.lineTo(-10, -100)
    ctx.moveTo(-100, 10)
    ctx.lineTo(100, 10)
    ctx.lineTo(100, -10)
    ctx.lineTo(-100, -10)
    ctx.lineTo(-100, 10)

    ctx.fill()
  camera.end()

  // the camera will not affect elements outside of
  // the begin/end block
  ctx.font = '50px monospace'
  ctx.fillStyle = 'black'
  ctx.fillText('fixed', 50, 92)
}
