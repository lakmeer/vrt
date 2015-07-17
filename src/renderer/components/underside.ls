
# Require

{ id, log } = require \std

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

    @arena.add-to @root
    @next-brick.add-to @root
    @score.add-to @root

    # Set up subcomponents position
    @next-brick.root.position.set -@opts.preview-distance-from-center, 0, -@opts.preview-distance-from-edge
    @arena.root.position.set 0, 0, -@opts.arena-distance-from-edge

