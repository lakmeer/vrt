
#
# "Standard Library" (after a fashion)
#
# Various helper functions
#

export id = -> it

export log = -> console.log.apply console, &; &0

export flip = (λ) -> (a, b) -> λ b, a

export delay = flip set-timeout

export floor = Math.floor

export random = Math.random

export rand = (min, max) -> min + random! * (max - min)

export rand-int = (min, max) -> min + floor random! * (max - min)

export random-from = (list) -> list[ rand 0, list.length - 1 ]

export add-v2 = (a, b) -> [ a.0 + b.0, a.1 + b.1 ]

export filter = (λ, list) --> [ x for x in list when λ x ]

export pi = Math.PI

export tau = pi * 2

export pow = Math.pow

export sin = Math.sin

export cos = Math.cos

export min = Math.min

export max = Math.max

export lerp = (min, max, p) --> min + p * (max - min)

export map = (λ, l) --> [ λ x for x in l ]

export join = (char, str) --> str.join char

export unlines = join "\n"

export wrap = (min, max, n) -->
  if n > max then min
  else if n < min then max
  else n

export limit = (min, max, n) -->
  if n > max then max
  else if n < min then min
  else n

export raf = # (λ) -> set-timeout λ, 1000 / 8
  if window.request-animation-frame? then that
  else if window.webkit-request-animation-frame? then that
  else if window.moz-request-animation-frame? then that
  else (λ) -> set-timeout λ, 1000 / 60


# Easing Equations

export Ease =  require \./easing

