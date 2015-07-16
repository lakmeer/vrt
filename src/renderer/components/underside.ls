
# Require

{ id, log } = require \std

{ Base } = require \./base


#
# Topside
#
# The menus and various scene parts that aren't part of the game itself
#

export class Underside extends Base
  (@opts, gs) ->
    log "Underside::new"

