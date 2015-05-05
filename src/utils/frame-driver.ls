
# Require

{ id, log, raf } = require \std


#
# Frame Driver
#
# Small engine that creates a frame loop
#

export class FrameDriver
  (@on-frame) ->
    log "FrameDriver::new"
    @state =
      zero: 0
      time: 0
      frame: 0
      running: no

  frame: ~>
    if @state.running then raf @frame

    now = Date.now! - @state.zero
    Δt = now - @state.time

    @state.time  = now
    @state.frame = @state.frame + 1
    @state.Δt    = Δt
    @on-frame Δt, @state.time, @state.frame

  start: ->
    if @state.running is yes then return
    log "FrameDriver::Start - starting"
    @state.zero = Date.now!
    @state.time = 0
    @state.running = yes
    @frame!

  stop: ->
    if @state.running is no then return
    log "FrameDriver::Stop - stopping"
    @state.running = no

