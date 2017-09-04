/*
  ported from Real-Time Collision Detection by Christer Ericson,
  published by Morgan Kaufmann Publishers, © 2005 Elsevier Inc
*/

var Vec2 = require('vec2');

var EPSILON = 1e-32;
var clamp = function(value, min, max) {
  if (value < min) {
    return min;
  } else if (value > max) {
    return max
  } else {
    return value;
  }
};

module.exports = function(p1, q1, p2, q2) {
  var d1 = q1.subtract(p1, true);
  var d2 = q2.subtract(p2, true);
  var r = p1.subtract(p2, true);
  var a = d1.dot(d1);
  var e = d2.dot(d2);
  var f = d2.dot(r);

  var t, s, c, b, denom;

  if (a <= EPSILON && e <= EPSILON) {
    return p1.subtract(p2, true).dot(p1.subtract(p2, true));
  }

  if (a <= EPSILON) {
    s = 0;
    t = f / e;
    t = clamp(t, 0, 1);
  } else {
    c = d1.dot(r);
    if (e <= EPSILON) {
      t = 0;
      s = clamp(-c / a, 0, 1);
    } else {
      b = d1.dot(d2);
      denom = a * e - b * b;

      if (denom !== 0) {
        s = clamp(( b * f - c * e) / denom, 0, 1)
      } else {
        s = 0;
      }

      t = (b * s + f) / e;

      if (t<0) {
        t = 0;
        s = clamp(-c / a, 0, 1);
      } else if (t > 1) {
        t = 1;
        s = clamp(( b - c) / a, 0, 1);
      }
    }
  }

  return [
    p1.add(d1.multiply(s, true), true),
    p2.add(d2.multiply(t, true), true)
  ];
};