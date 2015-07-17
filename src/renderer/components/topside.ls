
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
    super ...

    @start-menu  = new StartMenu  @opts, gs
    @fail-screen = new FailScreen @opts, gs

    @start-menu.add-to  @root
    @fail-screen.add-to @root

  toggle-start-menu: (state) ->
    @start-menu.visible = state

  update-start-menu: (gs) ->
    @start-menu.update gs

  update-fail-screen: (gs) ->
    @fail-screen.update gs

