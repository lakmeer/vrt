
# Require

{ log, delay } = require \std

{ FrameDriver }  = require \./utils/frame-driver
{ InputHandler } = require \./utils/input-handler
{ Timer }        = require \./utils/timer
{ GameState }    = require \./utils/game-state
{ DebugOutput }  = require \./utils/debug-output

{ TetrisGame }      = require \./game
{ ThreeJsRenderer } = require \./renderer


# Wait for DOM

<- document.add-event-listener \DOMContentLoaded


#
# Setup
#


p2m = (* 1.6/2048)

game-opts =
  tile-width  : 10
  tile-height : 20
  time-factor : 1

render-opts =
  units-per-meter: 1               # Global scaling factor for feel-correctness
  grid-size:  0.07                 # Abutting size of grid cells containing blocks
  block-size: 0.069                # Edge length of individual blocks
  desk-size: [ 1.6, 0.8, 0.1 ]     # Dimensions of play surface
  camera-distance-from-edge: 0.2   # Horizontal distance from player's eyes to front of desk
  camera-elevation: 0.5            # Vertical distance from desktop to player's eyes
  hard-drop-jolt-amount: 0.03      # Maximum excursion of 'jolt' effect when bricks land
  zap-particle-size: 0.008         # Size in meters of zap particles


  # Scene composition

  arena-offset-from-centre: 0.085        # Adjust horizontal position of arena
  arena-distance-from-edge: 0.57         # Distance from front of desk to front of arena

  score-distance-from-edge: p2m(419)     # Nixie display distance from edge of table
  score-offset-from-centre: p2m(55)      # Nixie display left-edge distance from centre
  score-tube-radius: p2m(63)             # Nixie tube radius
  score-base-radius: p2m(86.5)           # Nixie tube radius
  score-tube-height: p2m(200)            # Nixie tube height, not including round bit

  preview-dome-radius: p2m(104)              # Radius of glass dome containing next brick
  preview-dome-height: 0.20              # Height of preview dome, not icluding round bit
  preview-distance-from-edge: p2m(327)   # Position of next-brick-preview display
  preview-distance-from-center: p2m(487) # Position of next-brick-preview display from center
  preview-scale-factor: 0.5              # Show next-brick-preview at smaller scale


input-handler = new InputHandler
game-state    = new GameState game-opts
tetris-game   = new TetrisGame game-state

renderer = new ThreeJsRenderer render-opts, game-state
renderer.append-to document.body


#
# Debug
#

debug-output = new DebugOutput

InputHandler.on 192, ->
  if frame-driver.state.running
    frame-driver.stop!
  else
    frame-driver.start!

#InputHandler.debug-mode!

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


#
# Frame loop
#

frame-driver = new FrameDriver (Δt, time, frame) ->
  game-state.Δt             = Δt/game-opts.time-factor/game-state.slowdown
  game-state.elapsed-time   = time/game-opts.time-factor #/game-state.slowdown
  game-state.elapsed-frames = frame
  game-state.input-state    = input-handler.changes-since-last-frame!

  Timer.update-all game-state.Δt

  game-state := tetris-game.run-frame game-state, game-state.Δt
  renderer.render game-state, render-opts

  if debug-output
    debug-output.render game-state


#
# Init
#

#<- delay 1000

frame-driver.start!


#
# Debug:
#

#delay 30000, frame-driver~stop
tetris-game.begin-new-game game-state
#test-easing!


