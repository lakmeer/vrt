
# Require

{ id, log, wrap } = require \std

Timer = require \../utils/timer


# Helpers

menu-data = [
  { state: \start-game, text: "Start Game" }
  { state: \nothing, text: "Don't Start Game" }
]

limiter = wrap 0, menu-data.length - 1


#
# Start Menu Core
#
# Contains main logic for doing operations inside the start menu.
#
# Ideally this should just be a collection of stateless processing functions.
#

export prime-game-state = (gs, options) ->
  gs.start-menu =
    current-index: 0
    current-state: menu-data[0]
    menu-data: menu-data
    title-reveal-animation: Timer.create "Title reveal animation", options.animation.title-reveal-time
    flip-animation: Timer.create "Table flip animation", options.animation.table-flip-time

  gs.start-menu.flip-animation.idle-at-zero = on

  return gs

export update = (gs) ->
  return handle-input gs, gs.input


#
# Events
#

export begin-reveal = (gs) ->
  Timer.reset gs.start-menu.title-reveal-animation


#
# Menu Handling
#

export choose-option = (sms, index) ->
  sms.current-index = limiter index
  sms.current-state = menu-data[sms.current-index]

export select-prev-item = ({ current-index }:sms) ->
  choose-option sms, current-index - 1

export select-next-item = ({ current-index }:sms) ->
  choose-option sms, current-index + 1

