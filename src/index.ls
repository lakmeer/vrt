
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
renderer       = new ThreeJsRenderer render-options, game-state

time-factor    = 1


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
# Debug: jump straight to state we care about
#

#tetris-game.begin-new-game game-state

