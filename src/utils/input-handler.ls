
# Require

{ id, log, filter } = require \std
{ Timer } = require \./timer

# Reference Constants

key-repeat-time = 150

KEY =
  RETURN : 13
  ESCAPE : 27
  SPACE  : 32
  LEFT   : 37
  UP     : 38
  RIGHT  : 39
  DOWN   : 40
  Z      : 90
  X      : 88
  ONE    : 49
  TWO    : 50
  THREE  : 51
  FOUR   : 52
  FIVE   : 53
  SIX    : 54

ACTION_NAME =
  "#{KEY.RETURN}" : \confirm
  "#{KEY.ESCAPE}" : \cancel
  "#{KEY.SPACE}"  : \hard-drop
  "#{KEY.X}"      : \cw
  "#{KEY.Z}"      : \ccw
  "#{KEY.UP}"     : \up
  "#{KEY.LEFT}"   : \left
  "#{KEY.RIGHT}"  : \right
  "#{KEY.DOWN}"   : \down
  "#{KEY.ONE}"    : \debug-1
  "#{KEY.TWO}"    : \debug-2
  "#{KEY.THREE}"  : \debug-3
  "#{KEY.FOUR}"   : \debug-4
  "#{KEY.FIVE}"   : \debug-5


# Pure Helpers

event-summary = (key, state) ->
  { key, action: if state then \down else \up }

new-blank-keystate = ->
  up: off, down: off, left: off, right: off,
  action-a: off, action-b: off, confirm: off, cancel: off


#
# Input Handler
#
# Monitors keyboard input between frames and compiles a report about what has
# changed since last checked
#

export class InputHandler

  ->
    log "InputHandler::new"

    document.addEventListener \keydown, @state-setter on
    document.addEventListener \keyup,  @state-setter off

    @curr-keystate = new-blank-keystate!
    @last-keystate = new-blank-keystate!

    #@key-repeat-timer = new Timer key-repeat-time, true
    #@last-held-key = void

  state-setter: (state, { which }) ~~>
    if key = ACTION_NAME[which]
      @curr-keystate[key] = state
      if state is on and @last-held-key isnt key
        @last-held-key = key
        #@key-repeat-timer.reset!

  changes-since-last-frame: ->
    #if @key-repeat-timer.expired and @curr-keystate[@last-held-key] is on
    #  @last-keystate[@last-held-key] = off
    #  @key-repeat-timer.reset-with-remainder!

    filter id,
      for key, state of @curr-keystate
        was-different = state isnt @last-keystate[key]
        @last-keystate[key] = state
        if was-different
          event-summary key, state

  @debug-mode = ->
    document.addEventListener \keydown, ({ which }) ->
      log "InputHandler::debugMode -", which, (ACTION_NAME[which] or '[unbound]')

  @on = (code, λ) ->
    document.addEventListener \keydown, ({ which }) ->
      if which is code
        λ!

