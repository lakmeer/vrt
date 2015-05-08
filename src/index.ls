
# Require

{ log, delay } = require \std

{ FrameDriver }     = require \./utils/frame-driver
{ InputHandler }    = require \./utils/input-handler
{ DebugOutput }     = require \./utils/debug-output
{ TetrisGame }      = require \./game
{ ThreeJsRenderer } = require \./renderer


# Wait for DOM

<- document.add-event-listener \DOMContentLoaded


#
# Setup
#

game-state     = { metagame-state: \no-game }
game-options   = require \./config/game
render-options = require \./config/scene

input-handler  = new InputHandler
tetris-game    = new TetrisGame game-state, game-options
renderer       = new ThreeJsRenderer render-options, game-state, game-options

time-factor    = 2


#
# Debug
#

debug-output = new DebugOutput

InputHandler.on 192, ->
  if frame-driver.state.running
    frame-driver.stop!
  else
    frame-driver.start!

InputHandler.on 27, ->
  game-state.core.paused = !game-state.core.paused
  log if game-state.core.paused then "Game time paused" else "Game time unpaused"



#
# Frame loop
#

frame-driver = new FrameDriver (Δt, time, frame, fps) ->

  # Update gamestate with incoming external data
  game-state := tetris-game.update game-state, do
    input : input-handler.changes-since-last-frame!
    Δt    : Δt/time-factor
    time  : time/time-factor
    frame : frame
    fps   : fps

  # Render new gamestate
  renderer.render game-state
  debug-output?.render game-state


#
# Init
#

renderer.append-to document.body
frame-driver.start!


#
# Debug:
#

#delay 30000, frame-driver~stop
tetris-game.begin-new-game game-state
#InputHandler.debug-mode!  # Prints incoming keys

test-easing = ->
  { Ease } = require \std

  for el in document.query-selector-all \canvas
    el.style.display = \none

  for ease-name, ease of Ease
    cnv = document.create-element \canvas
    cnv.width = 200
    cnv.height = 200
    cnv.style.background = \white
    cnv.style.border-left = "3px solid black"
    ctx = cnv.get-context \2d
    document.body.append-child cnv

    ctx.font = "14px monospace"
    ctx.fill-text ease-name, 2, 16, 200

    for i from 0 to 100
      p = i / 100
      ctx.fill-rect 2 * i, 200 - (ease p, 0, 200), 2, 2
