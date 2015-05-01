
{ id, log, max, rand } = require \std

{ Base }           = require \./base
{ Frame }          = require \./frame
{ Brick }          = require \./brick
{ GuideLines }     = require \./guide-lines
{ ArenaCells }     = require \./arena-cells
{ BrickPreview }   = require \./brick-preview
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
      guide-lines : new GuideLines     @opts, gs
      arena-cells : new ArenaCells     @opts, gs
      this-brick  : new Brick          @opts, gs
      next-brick  : new BrickPreview   @opts, gs
      particles   : new ParticleEffect @opts, gs

    for name, part of @parts => part.add-to @registration

    @add-registration-helper!

    @registration.position.z = -1 * (@opts.camera-distance-from-edge + @opts.arena-distance-from-edge + @opts.block-size/2)

  jolt: ({ rows-to-remove, timers }:gs) ->
    p =
      if timers.removal-animation.active
        (1 - timers.removal-animation.progress)
      else if timers.hard-drop-effect.progress
        max (1 - timers.hard-drop-effect.progress)
      else
        0

    zz = rows-to-remove.length
    jolt = -1 * p * (1 + zz) * @opts.hard-drop-jolt-amount

  jitter: ({ rows-to-remove }) ->
    zz     = rows-to-remove.length * @opts.grid-size / 40  # Jitter size = 10% - 40% of block size
    jitter = [ (rand -zz, zz), (rand -zz, zz) ]

  zap-lines: ({ arena, rows-to-remove, timers }:gs, position-receiving-jolt) ->

    @parts.arena-cells.show-zap-effect jolt, gs

    # If rows were only just begun to be removed this frame, spawn particles,
    # but don't spawn them other times (just update them)
    if gs.flags.rows-removed-this-frame
      @parts.particles.reset!
      @parts.particles.prepare rows-to-remove
      @state.frames-since-rows-removed = 0

    # Jitter n' Jolt
    jolt   = @jolt gs
    jitter = @jitter gs
    position-receiving-jolt.x = jitter.0
    position-receiving-jolt.y = jitter.1 #+ jolt  # Doesn't work somehow?

    # Dance
    @parts.guide-lines.dance gs.elapsed-time

  update-particles: ({ timers }:gs) ->
    @parts.particles.update timers.removal-animation.progress, @state.frames-since-rows-removed, gs.Δt

  update: ({ arena, brick }:gs, position-receiving-jolt) ->

    # Render current arena state to blocks
    @parts.arena-cells.update-cells arena.cells

    # Update falling brick
    @parts.this-brick.display-shape brick.current
    @parts.this-brick.update-pos brick.current.pos

    # Show lines
    @parts.guide-lines.show-beam brick.current

    # Update preview brick
    @parts.next-brick.display-shape brick.next
    @parts.next-brick.update-wiggle gs, gs.elapsed-time

    # Return jolt effect value
    position-receiving-jolt.y = @jolt gs

    # Update internal state
    @state.frames-since-rows-removed += 1

