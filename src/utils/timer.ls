
# Require

{ id, log, floor } = require \std

ascii-progress-bar = (len, val, max) -->
  val = if val > max then max else val
  value-chars = floor len * val / max
  empty-chars = len - value-chars
  "▒" * value-chars + "-" * empty-chars

#
# Timer
#
# Tracks wehther a given amount of time has passed since first triggered
#

export class Timer

  all-timers = []
  progbar = ascii-progress-bar 21

  [ TIMER_ACTIVE, TIMER_EXPIRED ] = [ 0, 1 ]

  (@target-time = 1000, begin = no) ->
    @current-time = 0
    @state = if begin then TIMER_ACTIVE else TIMER_EXPIRED
    @active = begin
    @expired = not begin
    all-timers.push this

  active:~ -> @state is TIMER_ACTIVE
  expired:~ -> @state is TIMER_EXPIRED
  progress:~ -> @current-time / @target-time

  time-to-expiry:~
    -> @target-time - @current-time
    (exp-time) -> @current-time = @target-time - exp-time

  update: (Δt) ->
    if @active
      @current-time += Δt
      if @current-time >= @target-time
        @state = TIMER_EXPIRED

  reset: (time = @target-time) ->
    @current-time = 0
    @target-time = time
    @state = TIMER_ACTIVE

  reset-with-remainder: (time = @target-time) ->
    @current-time = @current-time - time
    @target-time = time
    @state = TIMER_ACTIVE

  stop: ->
    @current-time = 0
    @state = TIMER_EXPIRED

  destroy: ->
    all-timers.splice (all-timers.index-of this), 1

  run-for: (time) ->
    @time-to-expiry = time
    @state = TIMER_ACTIVE

  to-string: -> """
    TIMER: #{@target-time}
    STATE: #{@state} (#{@active}|#{@expired})
    #{progbar @current-time, @target-time}
  """

  @update-all = (Δt) ->
    all-timers.map (.update Δt)

