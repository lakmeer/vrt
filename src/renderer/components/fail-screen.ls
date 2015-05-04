
# Require

{ id, log, max } = require \std

{ Base } = require \./base


# Fail Menu
#
# Parent and coordinator of the componenets comprising the game over screen

export class FailScreen extends Base
  (@opts, gs) ->
    super ...
    log "FailScreen::new"

  update: (gs) ->

