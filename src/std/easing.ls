
# Require

{ pow } = require \std


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

export exp-in  = (t, b, e, c = e - b) -> c * (pow 2, 10 * (t - 1)) + b
export exp-out = (t, b, e, c = e - b) -> c * ((-pow 2, -10 * t) + 1) + b

