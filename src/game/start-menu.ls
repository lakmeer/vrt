
# Require

{ id, log, wrap } = require \std


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

export prime-game-state = (gamestate) ->
  gamestate.start-menu-state =
    current-index: 0
    current-state: menu-data[0]
    menu-data: menu-data

export choose-option = (sms, index) ->
  sms.current-index = limiter index
  sms.current-state = menu-data[sms.current-index]

export select-prev-item = ({ current-index }:sms) ->
  choose-option sms, current-index - 1

export select-next-item = ({ current-index }:sms) ->
  choose-option sms, current-index + 1

