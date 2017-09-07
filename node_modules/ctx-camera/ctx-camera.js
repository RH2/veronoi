module.exports = createCamera

function createCamera (ctx, eventContext, handlers) {
  eventContext = eventContext || window
  var canBeDirty = typeof ctx.dirty === 'function'

  var limits = {
    zoom: [0.2, 100]
  }

  var mouse = {
    down: false,
    pos: [0, 0],
    deltaPos: [0, 0],
    downPosition: [0, 0]
  }
  var translation = [0, 0]
  var frameSize = [
    eventContext.innerWidth,
    eventContext.innerHeight
  ]

  var zoom = 1

  function begin () {
    ctx.save()
    ctx.scale(zoom, zoom)
    ctx.translate(translation[0], translation[1])
  }

  function end () {
    ctx.restore()
  }

  function translateCamera (x, y) {
    translation[0] += x
    translation[1] += y
    canBeDirty && ctx.dirty()
  }

  function zoomCamera (amount) {
    zoom = Math.max(limits.zoom[0], Math.min(limits.zoom[1], zoom + amount))
    canBeDirty && ctx.dirty()
  }

  function zoomToScreenPoint (x, y, amount) {
    var ox = x / zoom
    var oy = y / zoom

    zoomCamera(amount)

    var nx = x / zoom
    var ny = y / zoom

    translateCamera(nx - ox, ny - oy)
  }

  var camera = {
    begin: begin,
    end: end,
    translate: translateCamera,
    zoom: zoomCamera,
    mouse: mouse,
    zoomToScreenPoint: zoomToScreenPoint
  }

  function event (el, name, defaultFn) {
    var fn = defaultFn
    if (typeof handlers[name] === 'function') {
      fn = function intercept (e) {
        handlers[name].call(camera, e, defaultFn)
      }
    }

    el.addEventListener(name, fn)
  }

  event(eventContext, 'mousedown', handleMouseDown)
  event(eventContext, 'mouseup', handleMouseUp)
  event(eventContext, 'mousemove', handleMouseMove)
  event(eventContext, 'mousewheel', handleMouseWheel)
  event(eventContext, 'resize', handleResize)

  function handleMouseDown (e) {
    mouse.down = true
    mouse.downPosition = [
      e.clientX,
      e.clientY
    ]
  }

  function handleMouseUp (e) {
    mouse.down = false
  }

  function handleMouseMove (e) {
    mouse.deltaPos[0] = e.clientX - mouse.pos[0]
    mouse.deltaPos[1] = e.clientY - mouse.pos[1]
    if (mouse.down) {
      translateCamera(mouse.deltaPos[0] / zoom, mouse.deltaPos[1] / zoom)
    }
    mouse.pos[0] = e.clientX
    mouse.pos[1] = e.clientY
  }

  function handleMouseWheel (e) {
    var delta = -e.deltaY / 1000
    zoomToScreenPoint(mouse.pos[0], mouse.pos[1], delta)
    e.preventDefault()
  }

  function handleResize (e) {
    frameSize[0] = eventContext.innerWidth
    frameSize[1] = eventContext.innerHeight
  }

  return camera
}
