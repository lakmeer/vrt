
# Require

{ id, log, floor } = require \std

ascii-progress-bar = (len, val, max) -->
  val = if val > max then max else val
  value-chars = floor len * val / max
  empty-chars = len - value-chars
  "+" * value-chars + "-" * empty-chars


# Internal State

[ TIMER_ACTIVE, TIMER_EXPIRED ] = [ 0, 1 ]


#
# Timer
#
# Tracks wehther a given amount of time has passed since first triggered
#


# Constructor

export create = (name = "Unnamed Timer", target-time = 1000, begin = no) ->
  log "New Timer:", name, target-time
  current-time : 0
  target-time: target-time
  progress: 0
  state : if begin then TIMER_ACTIVE else TIMER_EXPIRED
  active : begin
  expired : not begin
  time-to-expiry : target-time
  name: name


# Important functions

export update = (timer, Δt) ->
  if timer.active
    set-time timer, timer.current-time + Δt

export reset = (timer, time = timer.target-time) ->
  log "Timer::reset -", timer.name, time
  timer.target-time = time
  set-time timer, 0
  set-state timer, TIMER_ACTIVE

export stop = (timer) ->
  set-time timer, 0
  set-state timer, TIMER_EXPIRED


# Auxiliary functions

export run-for = (timer, time) ->
  timer.time-to-expiry = time
  set-state timer, TIMER_ACTIVE

export progress-of = (timer) ->
  timer.current-time / timer.target-time

export time-to-expiry = (timer) ->
  timer.target-time - timer.current-time

export set-time-to-expiry = (timer, expiry-time) ->
  set-time timer, timer.target-time - expiry-time

export reset-with-remainder = (timer, remainder) ->
  remainder ?= timer.current-time - timer.target-time
  set-time timer, remainder
  set-state timer, TIMER_ACTIVE

export to-string = do ->
  progbar = ascii-progress-bar 6
  (timer) -> """
    #{progbar timer.current-time, timer.target-time} #{timer.name + " " + timer.target-time} (#{timer.active}|#{timer.expired})
  """

export update-all-in = (thing, Δt) ->
  if thing.target-time?
    update thing, Δt
  else if typeof thing is \object
    for k, v of thing when v
      update-all-in v, Δt


# Internal helpers

set-state = (timer, state) ->
  timer.state = state
  timer.expired = state is TIMER_EXPIRED
  timer.active = state isnt TIMER_EXPIRED

set-time = (timer, time) ->
  timer.current-time = time
  timer.progress = timer.current-time / timer.target-time
  if timer.current-time >= timer.target-time
    timer.progress = 1
    set-state timer, TIMER_EXPIRED

