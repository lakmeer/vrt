
# Require

{ id, log, pi, floor } = require \std

{ Base } = require \./base

{ Arena }        = require \./arena
{ BrickPreview } = require \./brick-preview
{ NixieDisplay } = require \./nixie



#
# Topside
#
# The menus and various scene parts that aren't part of the game itself
#

export class Underside extends Base
  (@opts, gs) ->
    log "Underside::new"

    super ...

    @arena       = new Arena        @opts, gs
    @next-brick  = new BrickPreview @opts, gs
    @score       = new NixieDisplay @opts, gs

    @arena.add-to @registration
    @next-brick.add-to @registration
    @score.add-to @registration

    # Set up subcomponents position
    @next-brick.root.position.set -@opts.preview-distance-from-center, 0, -@opts.preview-distance-from-edge
    @arena.root.position.set 0, 0, -@opts.arena-distance-from-edge

    # Flip underside via registration point
    @registration.rotation.set pi, 0, 0
    @registration.position.set 0, -@opts.desk-size.2, -@opts.desk-size.1

  show-falling-brick: -> @arena.show-falling-brick!
  hide-falling-brick: -> @arena.hide-falling-brick!

  show-teardown-effect: (timer) ->
    num-rows = @opts.game-options.arena-height
    start-row = num-rows - floor num-rows * timer.progress

    for i from 0 til num-rows
      @arena.blink-row i, timer.progress

