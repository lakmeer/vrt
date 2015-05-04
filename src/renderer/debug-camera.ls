
# Require

{ id, log, sin, pi } = require \std


#
# Debug Camera Positioner
#
# Automatically moves the camera around
#
#

export class DebugCameraPositioner

  (@camera, @target) ->
    @state =
      enabled: no
      target: new THREE.Vector3 0, 0, 0

  enable: ->
    @state.enabled = yes

  update: (gs) ->
    if @state.enabled
      @auto-rotate gs.elapsed-time

  set-position: (phase, vphase = 0) ->
    @camera.position.x = @r * sin phase
    @camera.position.y = @y + @r * -sin vphase
    @camera.look-at if @target.position? then that else @target

  auto-rotate: (time) ->
    @set-position pi/10 * sin time / 1000

