
# Require

{ id, log, floor } = require \std

{ Base  } = require \./base
{ Brick } = require \./brick


#
# Class
#

export class FallingBrick extends Base

  (@opts, gs) ->
    super ...

    @grid   = opts.grid-size
    @height = @grid * gs.arena.height

    @brick = new Brick @opts, gs

    log opts

    space-adjustment = (@grid - @opts.block-size) / 2
    x-offset = floor @opts.game-options.arena-width / -2 + 2
    y-offset = -1.5

    @registration.add @brick.root
    @registration.position.x = x-offset * @grid - space-adjustment
    @registration.position.y = y-offset * @grid + space-adjustment

  display-shape: (brick) ->
    @brick.display-shape brick

  update-position: ([x, y]:pos) ->
    @root.position.set @grid * x, @height - @grid * y, 0

