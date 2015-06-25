
{ id, log, max, rand } = require \std

{ Base }           = require \./base
{ Frame }          = require \./frame
{ FallingBrick }   = require \./falling-brick
{ Guide }          = require \./guide
{ ArenaCells }     = require \./arena-cells
{ ParticleEffect } = require \./particle-effect


#
# Arena
#
# Houses and coordinates all sub-components which should be considered
# co-located with the arena itself.
#

export class Arena extends Base

  (@opts, gs) ->

    super ...

    log 'Renderer::Arena::new'

    @state =
      frames-since-rows-removed: 0

    @parts =
      frame       : new Frame          @opts, gs
      guide       : new Guide          @opts, gs
      arena-cells : new ArenaCells     @opts, gs
      this-brick  : new FallingBrick   @opts, gs
      particles   : new ParticleEffect @opts, gs

    for name, part of @parts => part.add-to @registration

    @registration.position.x = @opts.arena-offset-from-centre

  jolt: (gs) ->
    p = max 0, (1 - gs.arena.jolt-animation.progress)
    zz = gs.core.rows-to-remove.length
    jolt = -1 * p * (1 + zz) * @opts.hard-drop-jolt-amount

  jitter: (gs) ->
    p      = 1 - gs.arena.zap-animation.progress
    zz     = gs.core.rows-to-remove.length * @opts.grid-size / 40  # Jitter size = 10% - 40% of block size
    jitter = [ p*(rand -zz, zz), p*(rand -zz, zz) ]

  zap-lines: (gs, position-receiving-jolt) ->

    @parts.arena-cells.show-zap-effect gs

    # If rows were only just begun to be removed this frame, spawn particles,
    # but don't spawn them other times (just update them)
    if gs.core.rows-removed-this-frame
      @parts.particles.reset!
      @parts.particles.prepare gs.core.rows-to-remove
      @state.frames-since-rows-removed = 0

    # Flare
    @parts.guide.show-flare gs.arena.jolt-animation.progress

    # Jitter n' Jolt
    jolt   = @jolt gs
    jitter = @jitter gs

    position-receiving-jolt.x = jitter.0
    position-receiving-jolt.y = jitter.1 + jolt / 10 # Doesn't work somehow?

  update-particles: (gs) ->
    @parts.particles.update gs.arena.zap-animation.progress, @state.frames-since-rows-removed, gs.Δt

  update: ({ arena, brick }:gs, position-receiving-jolt) ->

    # Render current arena state to blocks
    @parts.arena-cells.update-cells arena.cells

    # Update falling brick
    @parts.this-brick.display-shape brick.current
    @parts.this-brick.update-position brick.current.pos

    # Show guide beams
    @parts.guide.show-beam brick.current
    @parts.guide.show-flare gs.core.hard-drop-animation.progress, gs.core.hard-drop-distance

    # Return jolt effect value
    position-receiving-jolt.y = @jolt gs

    # Update internal state
    @state.frames-since-rows-removed += 1

