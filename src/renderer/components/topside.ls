
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

    @start-menu.add-to  @registration
    @fail-screen.add-to @registration

    @registration.position.z = @opts.desk-size.1/2

  toggle-start-menu: (state) ->
    @start-menu.visible = state

  update-start-menu: (gs) ->
    @start-menu.update gs

  update-fail-screen: (gs) ->
    @fail-screen.update gs

