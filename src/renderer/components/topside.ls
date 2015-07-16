
# Require

{ id, log } = require \std

{ Base } = require \./base

{ StartMenu }  = require \./start-menu
{ FailScreen } = require \./fail-screen


#
# Topside
#
# The menus and various scene parts that aren't part of the game itself
#

export class Topside extends Base
  (@opts, gs) ->
    log "Topside::new"

    super ...

    @start-menu  = new StartMenu  @opts, gs
    @fail-screen = new FailScreen @opts, gs

    @start-menu.add-to @root
    @fail-screen.add-to @root

