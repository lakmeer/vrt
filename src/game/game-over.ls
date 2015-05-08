
# Require

{ id, log, wrap } = require \std

Timer = require \../utils/timer


# Helpers

menu-data = [
  { state: \restart, text: "Restart" }
  { state: \go-back, text: "Back to Main" }
]

limiter = wrap 0, menu-data.length - 1


#
# Fail Menu Core
#
# Contains main logic for doing operations inside the failure screen
#
# Ideally this should just be a collection of stateless processing functions.
#

export prime-game-state = (gs, options) ->
  gs.game-over =
    current-index: 0
    current-state: menu-data[0]
    menu-data: menu-data
    reveal-animation: Timer.create "Game over reveal animation", options.animation.game-over-reveal-time

export choose-option = (ms, index) ->
  ms.current-index = limiter index
  ms.current-state = menu-data[ms.current-index]

export select-prev-item = (ms) ->
  choose-option ms, ms.current-index - 1

export select-next-item = (ms) ->
  choose-option ms, ms.current-index + 1

