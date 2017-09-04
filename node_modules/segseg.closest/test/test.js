var closest = require('../segseg.closest');
var assert = require('assert');
var Vec2 = require('vec2');

describe('#segseg.closest', function() {
  it('should work when two segments are intersecting', function() {
    var seg = closest(
      Vec2(10, 10),
      Vec2(10, 100),
      Vec2(100, 10),
      Vec2(10, 10)
    );

    assert.equal(seg[0].x, 10);
    assert.equal(seg[0].y, 10);

    assert.equal(seg[1].x, 10);
    assert.equal(seg[1].y, 10);
  });

  it('should return a segment between the closest points', function() {
    var seg = closest(
      Vec2(20, 20),
      Vec2(20, 100),
      Vec2(100, 5),
      Vec2(10, 5)
    );

    assert.equal(seg[0].x, 20);
    assert.equal(seg[0].y, 20);

    assert.equal(seg[1].x, 20);
    assert.equal(seg[1].y, 5);
  });

  it('should return the start point of parallel lines', function() {
    var seg = closest(
      Vec2(0, 10),
      Vec2(100, 10),
      Vec2(0, 0),
      Vec2(100, 0)
    );

    assert.equal(seg[0].x, 0);
    assert.equal(seg[0].y, 10);

    assert.equal(seg[1].x, 0);
    assert.equal(seg[1].y, 0);
  });
});