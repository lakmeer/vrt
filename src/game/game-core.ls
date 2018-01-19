
# Require

{ id, log, add-v2, rand-int, wrap, random-from, Ease } = require \std

Timer = require \../utils/timer


#
# Game Core
#
# Contains main logic for doing operations inside the tetris game itself. Other
# stuff like menus and things don't go in here.
#
# Ideally this should just be a collection of stateless processing functions.
#

export prime-game-state = (gs, options) ->
  gs.core =
    paused: no
    slowdown: 1
    soft-drop-mode: off
    rows-to-remove: []
    rows-removed-this-frame: no
    starting-drop-speed: options.starting-drop-speed

    drop-timer               : Timer.create "Drop timer",           options.starting-drop-speed, true
    key-repeat-timer         : Timer.create "Key repeat",           options.key-repeat-time
    soft-drop-wait-timer     : Timer.create "Soft-drop wait time",  options.soft-drop-wait-time
    hard-drop-animation      : Timer.create "Hard-drop animation",  options.animation.hard-drop-effect-time, true
    preview-reveal-animation : Timer.create "Next brick animation", options.animation.preview-reveal-time

export animation-time-for-rows = (rows) ->
  10 + 40 * rows.length

export reset-drop-timer = (core) ->
  Timer.reset core.drop-timer, core.starting-drop-speed

