
# Require

{ log, pow, tau } = require \std


#
# Simple
#

export linear = (t, b, e, c = e - b) -> c * t + b


#
# Polynomials
#
# For polynomial easing, even powers need negative coefficient, odd ones don't
#

# Power 2
export quad-in   = (t, b, e, c = e - b) ->  c * t *   t   + b
export quad-out  = (t, b, e, c = e - b) -> -c * t * (t-2) + b

# Power 3
export cubic-in  = (t, b, e, c = e - b) ->  c *    t  **3      + b
export cubic-out = (t, b, e, c = e - b) ->  c * ((t-1)**3 + 1) + b

# Power 4
export quart-in  = (t, b, e, c = e - b) ->  c *    t  **4      + b
export quart-out = (t, b, e, c = e - b) -> -c * ((t-1)**4 - 1) + b

# Power 5
export quint-in  = (t, b, e, c = e - b) ->  c *    t  **5      + b
export quint-out = (t, b, e, c = e - b) ->  c * ((t-1)**5 + 1) + b


#
# Exponential
#

export exp-in  = (t, b, e, c = e - b) -> c *  ( pow 2, 10 * (t - 1)) + b
export exp-out = (t, b, e, c = e - b) -> c * ((-pow 2, -10 * t) + 1) + b


#
# Trigonometric
#

export circ-in  = (t, b, e, c = e - b) -> log -c * (Math.sqrt (1 - t*t) - 1) + b
export circ-out = (t, b, e, c = e - b) ->  c * (Math.sqrt (1 - t*t)    ) + b


#
# Special
#

elastic = (t, b, c, p, λ) ->
  if t is 0 then return b
  if t is 1 then return b + c
  s = if c < Math.abs c then p/4 else p/tau * Math.asin 1
  λ s, p

slack = 0.7

export elastic-in = (t, b, e, c = e - b, s = 1.70158) ->
  elastic t, b, e, slack, (s, p) ->
    -(c * Math.pow(2, 10 * (t -= 1)) * Math.sin( (t - s)*tau/p )) + b

export elastic-out = (t, b, e, c = e - b, s = 1.70158) ->
  log elastic t, b, e, slack, (s, p) ->
    c * Math.pow(2, -10 * t) * Math.sin( (t - s) * tau / p ) + c + b


/*
easeInBack: function (x, t, b, c, d, s) {
  if (s == undefined) s = 1.70158;
  return c*(t/=d)*t*((s+1)*t - s) + b;
},
easeOutBack: function (x, t, b, c, d, s) {
  if (s == undefined) s = 1.70158;
  return c*((t=t/d-1)*t*((s+1)*t + s) + 1) + b;
},
easeInBounce: function (x, t, b, c, d) {
  return c - jQuery.easing.easeOutBounce (x, d-t, 0, c, d) + b;
},
easeOutBounce: function (x, t, b, c, d) {
  if ((t/=d) < (1/2.75)) {
    return c*(7.5625*t*t) + b;
  } else if (t < (2/2.75)) {
    return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
  } else if (t < (2.5/2.75)) {
    return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
  } else {
    return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
  }
},
*/


#
# Test Functions
#

draw-test-graphs = ->

  for el in document.query-selector-all \canvas
    el.style.display = \none

  for ease-name, ease of module.exports
    cnv = document.create-element \canvas
    cnv.width = 200
    cnv.height = 200
    cnv.style.background = \white
    cnv.style.border-left = "3px solid black"
    ctx = cnv.get-context \2d
    document.body.append-child cnv

    ctx.font = "14px monospace"
    ctx.fill-text ease-name, 2, 16, 200

    for i from 0 to 100
      p = i / 100
      ctx.fill-rect 2 * i, 200 - (ease p, 0, 200), 2, 2

