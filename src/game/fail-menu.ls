
# Require

{ id, log, wrap } = require \std


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

export prime-game-state = (gamestate) ->
  gamestate.fail-menu-state =
    current-index: 0
    current-state: menu-data[0]
    menu-data: menu-data

export choose-option = (fms, index) ->
  fms.current-index = limiter index
  fms.current-state = menu-data[fms.current-index]

export select-prev-item = ({ current-index }:fms) ->
  choose-option fms, current-index - 1

export select-next-item = ({ current-index }:fms) ->
  choose-option fms, current-index + 1

