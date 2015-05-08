
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

  (options) ->
    @timers.removal-animation     = new Timer @options.removal-animation-time
    @timers.hard-drop-effect      = new Timer @options.hard-drop-effect-time
    @timers.title-reveal-timer    = new Timer @options.title-reveal-time
    @timers.failure-reveal-timer  = new Timer @options.title-reveal-time

    # Force hard drop timer to start at end
    @timers.hard-drop-effect.expire!

