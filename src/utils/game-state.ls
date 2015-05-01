
# Require

{ id, log, rand } = require \std
{ Timer } = require \./timer


#
# Game State
#
# Contains pretty much everything. We don't really want any state inside our
# game classes.
#

export class GameState

  defaults =
    metagame-state: \no-game
    input-state: []
    force-down-mode: off
    elapsed-time: 0
    elapsed-frames: 0
    rows-to-remove: []

    flags:
      rows-removed-this-frame: no

    score:
      points: 0
      lines: 0
      singles: 0
      doubles: 0
      triples: 0
      tetris: 0

    brick:
      next: void
      current: void

    timers:
      drop-timer: null
      force-drop-wait-tiemr: null
      key-repeat-timer: null
      removal-animation: null
      title-reveal-timer: null
      failure-reveal-timer: null

    options:
      tile-width: 10
      tile-height: 18
      tile-size: 20
      hard-drop-jolt-amount: 0.35
      drop-speed: 300
      force-drop-wait-time: 100
      removal-animation-time: 500
      hard-drop-effect-time: 100
      key-repeat-time: 100
      title-reveal-time: 4000

    arena:
      cells: [[]]
      width: 0
      height: 0

  (options) ->
    this <<< defaults
    this.options <<< options
    @timers.drop-timer            = new Timer @options.drop-speed
    @timers.force-drop-wait-timer = new Timer @options.force-drop-wait-time
    @timers.key-repeat-timer      = new Timer @options.key-repeat-time
    @timers.removal-animation     = new Timer @options.removal-animation-time
    @timers.hard-drop-effect      = new Timer @options.hard-drop-effect-time
    @timers.title-reveal-timer    = new Timer @options.title-reveal-time
    @timers.failure-reveal-timer  = new Timer @options.title-reveal-time
    @arena = @@new-arena @options.tile-width, @options.tile-height

  @new-arena = (width, height) ->
    cells: for row til height => for cell til width => 0
    width: width
    height: height

